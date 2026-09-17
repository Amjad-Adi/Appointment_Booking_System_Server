import {
    getOrganization,
    getOrganizationIdByUuid,
} from "./organization.service.js";

import {
    getService,
} from "./service.service.js";

import {
    getRooms,
    getRoomIdByUuid,
} from "./room.service.js";

import {
    getWorkingHours,
} from "./working-hours.services.js";

import {
    getSpecialDays,
} from "./special-days.service.js";

import {
    getUsers,
    getUserIdByUuid, getUser,
} from "./user.service.js";

import {
    schedulingRepository,
} from "../repositories/scheduling.repository.js";

import type {
    SchedulingOption,
    SchedulingRequest,
    SchedulingResponse,
} from "../models/scheduling.model.js";

import {
    AppointmentTimeType,
} from "../models/enums/appointment-time-type.js";

import {
    ActivationStatus,
} from "../models/enums/activation-status.js";

import {
    DayOfWeek,
} from "../models/enums/day-of-week.js";

import {
    Role,
} from "../models/enums/roles.js";

import {
    NotFoundError,
} from "../errors/not-found.error.js";

const OPTIONS_PER_WORKER = 3;
const SEARCH_DAYS = 30;

const DAY_NAMES: DayOfWeek[] = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
];

interface SchedulingInterval {
    startAtUTC: Date;
    endAtUTC: Date;
}

function getWorkingDateTime(
    date: Date,
    time: string,
): Date {
    const [
        hours,
        minutes,
        seconds = "0",
    ] = time.split(":");

    const result =
        new Date(date);

    result.setUTCHours(
        Number(hours),
        Number(minutes),
        Number(seconds),
        0,
    );

    return result;
}

function addMinutes(
    date: Date,
    minutes: number,
): Date {
    return new Date(
        date.getTime() +
        minutes * 60 * 1000,
    );
}

function mergeIntervals(
    intervals: SchedulingInterval[],
): SchedulingInterval[] {
    const sortedIntervals =
        [...intervals].sort(
            (a, b) =>
                a.startAtUTC.getTime() -
                b.startAtUTC.getTime(),
        );

    const mergedIntervals:
        SchedulingInterval[] = [];

    for (
        const interval of sortedIntervals
        ) {
        const last =
            mergedIntervals[
            mergedIntervals.length - 1
                ];

        if (!last) {
            mergedIntervals.push({
                startAtUTC:
                    new Date(
                        interval.startAtUTC,
                    ),

                endAtUTC:
                    new Date(
                        interval.endAtUTC,
                    ),
            });

            continue;
        }

        /*
         * Merge overlapping or touching intervals.
         */
        if (
            interval.startAtUTC.getTime() <=
            last.endAtUTC.getTime()
        ) {
            if (
                interval.endAtUTC.getTime() >
                last.endAtUTC.getTime()
            ) {
                last.endAtUTC =
                    new Date(
                        interval.endAtUTC,
                    );
            }
        } else {
            mergedIntervals.push({
                startAtUTC:
                    new Date(
                        interval.startAtUTC,
                    ),

                endAtUTC:
                    new Date(
                        interval.endAtUTC,
                    ),
            });
        }
    }

    return mergedIntervals;
}

/**
 * Generates all continuous appointment candidates
 * inside the working period.
 *
 * Example:
 *
 * working period: 08:00–10:00
 * duration: 30 minutes
 *
 * candidates:
 * 08:00–08:30
 * 08:30–09:00
 * 09:00–09:30
 * 09:30–10:00
 *
 * Blocking intervals are skipped.
 */
function findAvailableCandidates(
    workingStart: Date,
    workingEnd: Date,
    durationInMinutes: number,
    blockingIntervals: SchedulingInterval[],
): SchedulingInterval[] {
    const candidates:
        SchedulingInterval[] = [];

    const mergedIntervals =
        mergeIntervals(
            blockingIntervals,
        );

    let candidateStart =
        new Date(workingStart);

    for (
        const blockingInterval of mergedIntervals
        ) {
        /*
         * If the blocking interval ends before
         * the current candidate, it has no effect.
         */
        if (
            blockingInterval.endAtUTC <=
            candidateStart
        ) {
            continue;
        }

        /*
         * Generate all candidates between the
         * current candidate and the next block.
         */
        while (true) {
            const candidateEnd =
                addMinutes(
                    candidateStart,
                    durationInMinutes,
                );

            /*
             * Candidate no longer fits before
             * the blocking interval.
             */
            if (
                candidateEnd >
                blockingInterval.startAtUTC
            ) {
                break;
            }

            candidates.push({
                startAtUTC:
                    new Date(
                        candidateStart,
                    ),

                endAtUTC:
                    new Date(
                        candidateEnd,
                    ),
            });

            candidateStart =
                candidateEnd;
        }

        /*
         * Move the search pointer beyond the
         * blocking interval.
         */
        if (
            candidateStart <
            blockingInterval.endAtUTC
        ) {
            candidateStart =
                new Date(
                    blockingInterval.endAtUTC,
                );
        }

        if (
            candidateStart >=
            workingEnd
        ) {
            return candidates;
        }
    }

    /*
     * Generate candidates after the final
     * blocking interval.
     */
    while (true) {
        const candidateEnd =
            addMinutes(
                candidateStart,
                durationInMinutes,
            );

        if (
            candidateEnd >
            workingEnd
        ) {
            break;
        }

        candidates.push({
            startAtUTC:
                new Date(
                    candidateStart,
                ),

            endAtUTC:
                new Date(
                    candidateEnd,
                ),
        });

        candidateStart =
            candidateEnd;
    }

    return candidates;
}

export async function getAvailableTimes(
    organizationUuid: string,
    request: SchedulingRequest,
): Promise<SchedulingResponse> {
    const organization =
        await getOrganization(
            organizationUuid,
        );

    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (
        organizationId ===
        undefined
    ) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const service =
        await getService(
            request.serviceUuid,
            organizationUuid,
        );

    /*
     * WORKER:
     * Search only for the requested worker.
     */
    let workers;

    if (request.timeType === AppointmentTimeType.WORKER) {
        workers = [await getUser(request.workerUuid as string)];
    } else {
        workers = await getUsers({
            filter: {
                organizationUuid,
                role: Role.WORKER,
                status: ActivationStatus.ACTIVE,
            },
            page: 1,
            limit: 100,
        });
    }

    /*
     * Get active rooms once.
     */
    const organizationRooms =
        await getRooms({
            filter: {
                organizationUuid,

                status:
                ActivationStatus.ACTIVE,
            },

            page: 1,
            limit: 100,
        });

    const fromAtUTC =
        request.fromAtUTC
            ? new Date(
                request.fromAtUTC,
            )
            : new Date();

    if (
        Number.isNaN(
            fromAtUTC.getTime(),
        )
    ) {
        throw new Error(
            "Invalid fromAtUTC",
        );
    }

    /*
     * Store separate options for each worker.
     */
    const workerOptions =
        new Map<
            string,
            SchedulingOption[]
        >();

    for (
        const worker of workers
        ) {
        workerOptions.set(
            worker.uuid,
            [],
        );
    }

    /*
     * Search up to 30 days ahead.
     */
    for (
        let dayOffset = 0;

        dayOffset < SEARCH_DAYS;

        dayOffset++
    ) {
        const currentDate =
            new Date(fromAtUTC);

        currentDate.setUTCDate(
            currentDate.getUTCDate() +
            dayOffset,
        );

        /*
         * PostgreSQL DATE format: YYYY-MM-DD.
         */
        const dateString =
            currentDate
                .toISOString()
                .substring(0, 10);

        const specialDays =
            await getSpecialDays({
                page: 1,

                limit: 1,

                filter: {
                    organizationUuid,

                    status:
                    ActivationStatus.ACTIVE,

                    fromDate:
                    dateString,

                    toDate:
                    dateString,
                },
            });

        /*
         * Skip organization-wide special days.
         */
        if (
            specialDays.length > 0
        ) {
            continue;
        }

        const dayOfWeek =
            DAY_NAMES[
                currentDate.getUTCDay()
                ];

        const workingHours =
            await getWorkingHours({
                filter: {
                    organizationUuid,
                    dayOfWeek,
                },

                page: 1,
                limit: 1,
            });

        const todayWorkingHours =
            workingHours[0];

        if (
            !todayWorkingHours?.startTime ||
            !todayWorkingHours?.endTime
        ) {
            continue;
        }

        const workingStart =
            getWorkingDateTime(
                currentDate,
                todayWorkingHours.startTime,
            );

        const workingEnd =
            getWorkingDateTime(
                currentDate,
                todayWorkingHours.endTime,
            );

        /*
         * On the first day, don't return times
         * before fromAtUTC.
         */
        let searchStart =
            workingStart;

        if (
            dayOffset === 0 &&
            fromAtUTC > searchStart
        ) {
            searchStart =
                fromAtUTC;
        }

        if (
            searchStart >=
            workingEnd
        ) {
            continue;
        }

        /*
         * Search each worker independently.
         */
        for (
            const worker of workers
            ) {
            const currentWorkerOptions =
                workerOptions.get(
                    worker.uuid,
                ) ?? [];

            /*
             * This worker already has three
             * available options.
             */
            if (
                currentWorkerOptions.length >=
                OPTIONS_PER_WORKER
            ) {
                continue;
            }

            const rooms =
                organizationRooms.filter(
                    room =>
                        room.userUuid ===
                        worker.uuid,
                );

            if (
                rooms.length === 0
            ) {
                continue;
            }

            const workerId =
                await getUserIdByUuid(
                    worker.uuid,
                );

            if (
                workerId ===
                undefined
            ) {
                continue;
            }

            /*
             * A worker may have multiple rooms.
             * We collect all available candidates
             * and then choose the earliest three
             * unique start times.
             */
            const workerDayOptions:
                SchedulingOption[] = [];

            for (
                const room of rooms
                ) {
                const roomId =
                    await getRoomIdByUuid(
                        room.uuid,
                        organizationUuid,
                    );

                if (
                    roomId ===
                    undefined
                ) {
                    continue;
                }

                const blockingIntervals =
                    await schedulingRepository
                        .findBlockingIntervals(
                            organizationId,
                            workerId,
                            roomId,
                            request.userId,
                            searchStart.toISOString(),
                            workingEnd.toISOString(),
                        );

                const candidates =
                    findAvailableCandidates(
                        searchStart,
                        workingEnd,
                        service.durationInMinutes,
                        blockingIntervals,
                    );

                for (
                    const candidate of candidates
                    ) {
                    /*
                     * Do not generate more than
                     * necessary for this worker.
                     */
                    if (
                        workerDayOptions.length >=
                        OPTIONS_PER_WORKER
                    ) {
                        break;
                    }

                    const option:
                        SchedulingOption = {
                        organization: {
                            uuid:
                            organization.uuid,

                            name:
                            organization.name,
                        },

                        service: {
                            uuid:
                            service.uuid,

                            name:
                            service.name,

                            durationInMinutes:
                            service.durationInMinutes,
                        },

                        room: {
                            uuid:
                            room.uuid,

                            name:
                            room.name,
                        },

                        scheduledStartAtUTC:
                            candidate
                                .startAtUTC
                                .toISOString(),

                        scheduledEndAtUTC:
                            candidate
                                .endAtUTC
                                .toISOString(),
                    };

                    /*
                     * Avoid duplicate start times
                     * from different rooms.
                     */
                    const duplicate =
                        workerDayOptions.some(
                            existing =>
                                existing
                                    .scheduledStartAtUTC ===
                                option
                                    .scheduledStartAtUTC,
                        ) ||
                        currentWorkerOptions.some(
                            existing =>
                                existing
                                    .scheduledStartAtUTC ===
                                option
                                    .scheduledStartAtUTC,
                        );

                    if (
                        duplicate
                    ) {
                        continue;
                    }

                    /*
                     * Final conflict check.
                     */
                    const conflict =
                        await schedulingRepository
                            .hasConflict(
                                organizationId,
                                workerId,
                                roomId,
                                request.userId,
                                candidate
                                    .startAtUTC
                                    .toISOString(),

                                candidate
                                    .endAtUTC
                                    .toISOString(),
                            );

                    if (
                        conflict
                    ) {
                        continue;
                    }

                    workerDayOptions.push(
                        option,
                    );
                }
            }

            /*
             * Sort this day's options before
             * adding them to the worker list.
             */
            workerDayOptions.sort(
                (a, b) =>
                    new Date(
                        a.scheduledStartAtUTC,
                    ).getTime() -
                    new Date(
                        b.scheduledStartAtUTC,
                    ).getTime(),
            );

            /*
             * Add only the earliest options
             * needed to reach three.
             */
            for (
                const option of workerDayOptions
                ) {
                if (
                    currentWorkerOptions.length >=
                    OPTIONS_PER_WORKER
                ) {
                    break;
                }

                const duplicate =
                    currentWorkerOptions.some(
                        existing =>
                            existing
                                .scheduledStartAtUTC ===
                            option
                                .scheduledStartAtUTC,
                    );

                if (
                    duplicate
                ) {
                    continue;
                }

                currentWorkerOptions.push(
                    option,
                );
            }

            currentWorkerOptions.sort(
                (a, b) =>
                    new Date(
                        a.scheduledStartAtUTC,
                    ).getTime() -
                    new Date(
                        b.scheduledStartAtUTC,
                    ).getTime(),
            );

            workerOptions.set(
                worker.uuid,
                currentWorkerOptions.slice(
                    0,
                    OPTIONS_PER_WORKER,
                ),
            );
        }

        /*
         * Stop when every worker has three
         * available options.
         */
        const allWorkersComplete =
            workers.every(
                worker =>
                    (
                        workerOptions.get(
                            worker.uuid,
                        )?.length ?? 0
                    ) >=
                    OPTIONS_PER_WORKER,
            );

        if (
            allWorkersComplete
        ) {
            break;
        }
    }

    /*
     * Build the grouped response.
     *
     * Workers without availability are excluded.
     */
    const groupedWorkers =
        workers
            .map(worker => ({
                worker: {
                    uuid:
                    worker.uuid,

                    firstName:
                    worker.firstName,

                    lastName:
                    worker.lastName,

                    profilePicturePath:
                    worker.profilePicturePath,
                },

                options:
                    (
                        workerOptions.get(
                            worker.uuid,
                        ) ?? []
                    )
                        .sort(
                            (a, b) =>
                                new Date(
                                    a.scheduledStartAtUTC,
                                ).getTime() -
                                new Date(
                                    b.scheduledStartAtUTC,
                                ).getTime(),
                        )
                        .slice(
                            0,
                            OPTIONS_PER_WORKER,
                        ),
            }))
            .filter(
                group =>
                    group.options.length > 0,
            );

    return {
        workers:
        groupedWorkers,
    };
}