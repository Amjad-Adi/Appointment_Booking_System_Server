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
    getUserIdByUuid,
} from "./user.service.js";

import {
    schedulingRepository,
} from "../repositories/scheduling.repository.js";

import type {
    SchedulingOption,
    SchedulingRequest,
    SchedulingResponse,
} from "../models/scheduling.model";

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


const MAX_OPTIONS = 30;
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


function getDayOfWeek(
    date: Date,
): DayOfWeek {
    return DAY_NAMES[
        date.getUTCDay()
        ];
}


function getUTCDateString(
    date: Date,
): string {
    return date
        .toISOString()
        .slice(0, 10);
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


interface SchedulingInterval {
    startAtUTC: Date;
    endAtUTC: Date;
}


/**
 * Merges overlapping or touching
 * blocking intervals.
 *
 * The scheduling repository already
 * normalizes all intervals to Date.
 */
function mergeIntervals(
    intervals: SchedulingInterval[],
): SchedulingInterval[] {
    const sorted = [
        ...intervals,
    ].sort(
        (a, b) =>
            a.startAtUTC.getTime() -
            b.startAtUTC.getTime(),
    );

    const merged: SchedulingInterval[] =
        [];

    for (const interval of sorted) {
        const last =
            merged[
            merged.length - 1
                ];

        if (!last) {
            merged.push({
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
         * Merge overlapping or touching
         * intervals.
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

            continue;
        }

        merged.push({
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

    return merged;
}


/**
 * Finds the earliest appointment interval
 * that fits completely inside the working
 * hours and does not overlap a blocking
 * interval.
 */
function findNextCandidate(
    workingStart: Date,
    workingEnd: Date,
    durationInMinutes: number,
    blockingIntervals: SchedulingInterval[],
): SchedulingInterval | null {
    let candidate =
        new Date(workingStart);

    const merged =
        mergeIntervals(
            blockingIntervals,
        );

    for (const interval of merged) {
        const candidateEnd =
            addMinutes(
                candidate,
                durationInMinutes,
            );

        /*
         * The appointment fits completely
         * before this blocking interval.
         */
        if (
            candidateEnd <=
            interval.startAtUTC
        ) {
            return {
                startAtUTC:
                candidate,

                endAtUTC:
                candidateEnd,
            };
        }

        /*
         * The candidate overlaps the blocking
         * interval, so move it to the end of
         * that interval.
         */
        if (
            candidate <
            interval.endAtUTC
        ) {
            candidate =
                new Date(
                    interval.endAtUTC,
                );
        }

        /*
         * There is no remaining working time.
         */
        if (
            candidate >=
            workingEnd
        ) {
            return null;
        }
    }

    /*
     * Check the remaining period after
     * all blocking intervals.
     */
    const candidateEnd =
        addMinutes(
            candidate,
            durationInMinutes,
        );

    if (
        candidateEnd <=
        workingEnd
    ) {
        return {
            startAtUTC:
            candidate,

            endAtUTC:
            candidateEnd,
        };
    }

    return null;
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

    let workers;

    /*
     * WORKER:
     * Only search for the requested worker.
     */
    if (
        request.timeType ===
        AppointmentTimeType.WORKER
    ) {
        const users =
            await getUsers({
                filter: {
                    organizationUuid,
                    role: Role.WORKER,
                    status:
                    ActivationStatus.ACTIVE,
                },

                page: 1,
                limit: 100,
            });

        workers =
            users.filter(
                user =>
                    user.uuid ===
                    request.workerUuid,
            );

        if (
            workers.length === 0
        ) {
            throw new NotFoundError(
                "Worker",
            );
        }
    }

    /*
     * NEAREST:
     * Search all active workers in
     * the organization.
     */
    else {
        workers =
            await getUsers({
                filter: {
                    organizationUuid,
                    role: Role.WORKER,
                    status:
                    ActivationStatus.ACTIVE,
                },

                page: 1,
                limit: 100,
            });
    }

    /*
     * Get all active organization rooms
     * once instead of querying them for
     * every candidate.
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

    const options:
        SchedulingOption[] = [];

    /*
     * Search up to 30 days ahead.
     */
    for (
        let dayOffset = 0;

        dayOffset < SEARCH_DAYS &&
        options.length < MAX_OPTIONS;

        dayOffset++
    ) {
        const currentDate =
            new Date(fromAtUTC);

        currentDate.setUTCDate(
            currentDate.getUTCDate() +
            dayOffset,
        );

        const dateString =
            getUTCDateString(
                currentDate,
            );

        /*
         * Skip active special days.
         */
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

        if (
            specialDays[0]
        ) {
            continue;
        }

        /*
         * Get working hours for this day.
         */
        const dayOfWeek =
            getDayOfWeek(
                currentDate,
            );

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
         * On the first day, don't return
         * appointments before fromAtUTC.
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
         * Search workers.
         */
        for (
            const worker of workers
            ) {
            if (
                options.length >=
                MAX_OPTIONS
            ) {
                break;
            }

            /*
             * Only rooms assigned to this
             * worker can be used.
             */
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
             * Search each room assigned
             * to the worker.
             */
            for (
                const room of rooms
                ) {
                if (
                    options.length >=
                    MAX_OPTIONS
                ) {
                    break;
                }

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

                /*
                 * Get all appointments and
                 * approved time blocks that
                 * can block this candidate.
                 *
                 * The repository returns
                 * Date-based intervals.
                 */
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

                /*
                 * Find the earliest interval
                 * that fits.
                 */
                const candidate =
                    findNextCandidate(
                        searchStart,
                        workingEnd,
                        service.durationInMinutes,
                        blockingIntervals,
                    );

                if (
                    !candidate
                ) {
                    continue;
                }

                /*
                 * Final conflict check.
                 *
                 * This protects against a conflict
                 * appearing between the blocking
                 * interval lookup and candidate
                 * validation.
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

                options.push({
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
                });
            }
        }
    }

    /*
     * Always return results chronologically.
     */
    options.sort(
        (a, b) =>
            new Date(
                a.scheduledStartAtUTC,
            ).getTime() -
            new Date(
                b.scheduledStartAtUTC,
            ).getTime(),
    );

    return {
        options:
            options.slice(
                0,
                MAX_OPTIONS,
            ),
    };
}