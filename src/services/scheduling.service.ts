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
    getUser,
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

/**
 * Returns the UTC offset, in milliseconds, that applies to the
 * supplied instant in the supplied IANA timezone.
 *
 * Example:
 *
 * 2026-09-17T07:34:00Z
 * Asia/Jerusalem
 * -> +03:00
 */
function getTimeZoneOffset(
    date: Date,
    timeZone: string,
): number {
    const parts =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23",
            },
        ).formatToParts(date);

    const values = Object.fromEntries(
        parts
            .filter(
                part =>
                    part.type !== "literal",
            )
            .map(
                part => [
                    part.type,
                    Number(part.value),
                ],
            ),
    );

    const asUTC =
        Date.UTC(
            values.year,
            values.month - 1,
            values.day,
            values.hour,
            values.minute,
            values.second,
        );

    return asUTC - date.getTime();
}

/**
 * Converts a local date/time belonging to an IANA timezone
 * into the corresponding UTC instant.
 *
 * Input:
 *     2026-09-17T08:00
 *     Asia/Jerusalem
 *
 * Result:
 *     2026-09-17T05:00:00.000Z
 */
function organizationLocalToUTC(
    localDateTime: string,
    timeZone: string,
): Date {
    const match =
        localDateTime.match(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
        );

    if (!match) {
        throw new Error(
            `Invalid local date/time: ${localDateTime}`,
        );
    }

    const [
        ,
        year,
        month,
        day,
        hours,
        minutes,
        seconds = "0",
    ] = match;

    const naiveUTC =
        new Date(
            Date.UTC(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hours),
                Number(minutes),
                Number(seconds),
            ),
        );

    let result =
        new Date(
            naiveUTC.getTime() -
            getTimeZoneOffset(
                naiveUTC,
                timeZone,
            ),
        );

    result =
        new Date(
            naiveUTC.getTime() -
            getTimeZoneOffset(
                result,
                timeZone,
            ),
        );

    return result;
}

/**
 * Returns the calendar date represented by an instant
 * in the organization's timezone.
 */
function getLocalDate(
    date: Date,
    timeZone: string,
): string {
    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            },
        ).formatToParts(date);

    const values = Object.fromEntries(
        parts
            .filter(
                part =>
                    part.type !== "literal",
            )
            .map(
                part => [
                    part.type,
                    part.value,
                ],
            ),
    );

    return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Adds calendar days to a YYYY-MM-DD date.
 *
 * This is deliberately calendar based rather than millisecond based.
 */
function addCalendarDays(
    dateString: string,
    days: number,
): string {
    const date =
        new Date(
            `${dateString}T12:00:00.000Z`,
        );

    date.setUTCDate(
        date.getUTCDate() + days,
    );

    return date
        .toISOString()
        .substring(0, 10);
}

/**
 * Returns the weekday for a YYYY-MM-DD calendar date.
 */
function getDayOfWeek(
    dateString: string,
): DayOfWeek {
    const date =
        new Date(
            `${dateString}T12:00:00.000Z`,
        );

    return DAY_NAMES[
        date.getUTCDay()
        ];
}

/**
 * Converts an organization's local working-hour value into
 * an actual UTC instant.
 *
 * The TIME column is a wall-clock value, not a UTC value.
 */
function getWorkingDateTime(
    dateString: string,
    time: string,
    timeZone: string,
): Date {
    const normalizedTime =
        time.length >= 8
            ? time.substring(0, 8)
            : time;

    return organizationLocalToUTC(
        `${dateString}T${normalizedTime}`,
        timeZone,
    );
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

/**
 * Merges overlapping and touching blocking intervals.
 */
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
        if (
            interval.endAtUTC.getTime() <=
            interval.startAtUTC.getTime()
        ) {
            continue;
        }

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

            continue;
        }

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

    return mergedIntervals;
}

/**
 * Finds absolute appointment candidates inside the free portions
 * of a working interval.
 *
 * IMPORTANT:
 *
 * There is NO artificial scheduling grid.
 *
 * The service duration only determines whether an appointment
 * can fit inside a free interval.
 *
 * Candidate starts are:
 *
 * 1. The beginning of every free interval.
 * 2. The preferred time, when it falls inside a free interval.
 *
 * The candidates are then sorted by their absolute distance
 * from preferredStart.
 *
 * Example:
 *
 * working: 07:00–12:00
 *
 * blocked:
 * 07:58–08:05
 *
 * preferred:
 * 08:00
 *
 * Possible candidates include:
 *
 * 07:00
 * 08:05
 * ...
 *
 * The candidate closest to 08:00 is selected first.
 *
 * If another blocking interval ends at 07:58:
 *
 * 07:58
 * 08:05
 *
 * then 07:58 is selected first because:
 *
 * |07:58 - 08:00| = 2 minutes
 * |08:05 - 08:00| = 5 minutes
 */
function findAvailableCandidates(
    workingStart: Date,
    workingEnd: Date,
    durationInMinutes: number,
    blockingIntervals: SchedulingInterval[],
    preferredStart: Date,
): SchedulingInterval[] {
    if (
        durationInMinutes <= 0 ||
        workingStart >= workingEnd
    ) {
        return [];
    }

    const candidates:
        SchedulingInterval[] = [];

    const mergedIntervals =
        mergeIntervals(
            blockingIntervals,
        );

    let freeStart =
        new Date(workingStart);

    for (
        const blockingInterval of mergedIntervals
        ) {
        /*
         * Ignore blocks completely before the working period.
         */
        if (
            blockingInterval.endAtUTC <=
            workingStart
        ) {
            continue;
        }

        /*
         * No more relevant blocks after the working period.
         */
        if (
            blockingInterval.startAtUTC >=
            workingEnd
        ) {
            break;
        }

        /*
         * Clamp the blocking interval to the working period.
         */
        const blockStart =
            blockingInterval.startAtUTC <
            workingStart
                ? new Date(workingStart)
                : new Date(
                    blockingInterval.startAtUTC,
                );

        const blockEnd =
            blockingInterval.endAtUTC >
            workingEnd
                ? new Date(workingEnd)
                : new Date(
                    blockingInterval.endAtUTC,
                );

        /*
         * There is a free interval before this block.
         */
        if (
            freeStart <
            blockStart
        ) {
            const freeEnd =
                new Date(blockStart);

            /*
             * Candidate at the beginning of the free interval.
             */
            const freeStartCandidateEnd =
                addMinutes(
                    freeStart,
                    durationInMinutes,
                );

            if (
                freeStartCandidateEnd <=
                freeEnd
            ) {
                candidates.push({
                    startAtUTC:
                        new Date(
                            freeStart,
                        ),

                    endAtUTC:
                    freeStartCandidateEnd,
                });
            }

            /*
             * If the preferred time is inside this free interval,
             * use it as another candidate.
             *
             * This allows an exact request such as 08:00 to remain
             * a valid candidate instead of forcing it onto a grid.
             */
            if (
                preferredStart >=
                freeStart &&
                preferredStart <
                freeEnd
            ) {
                const preferredEnd =
                    addMinutes(
                        preferredStart,
                        durationInMinutes,
                    );

                if (
                    preferredEnd <=
                    freeEnd
                ) {
                    candidates.push({
                        startAtUTC:
                            new Date(
                                preferredStart,
                            ),

                        endAtUTC:
                        preferredEnd,
                    });
                }
            }
        }

        /*
         * The next free interval begins exactly when
         * this blocking interval ends.
         */
        if (
            blockEnd >
            freeStart
        ) {
            freeStart =
                new Date(blockEnd);
        }

        if (
            freeStart >=
            workingEnd
        ) {
            break;
        }
    }

    /*
     * Process the final free interval.
     */
    if (
        freeStart <
        workingEnd
    ) {
        const freeEnd =
            new Date(workingEnd);

        /*
         * Candidate at the beginning of the final free interval.
         */
        const freeStartCandidateEnd =
            addMinutes(
                freeStart,
                durationInMinutes,
            );

        if (
            freeStartCandidateEnd <=
            freeEnd
        ) {
            candidates.push({
                startAtUTC:
                    new Date(
                        freeStart,
                    ),

                endAtUTC:
                freeStartCandidateEnd,
            });
        }

        /*
         * Preferred time inside the final free interval.
         */
        if (
            preferredStart >=
            freeStart &&
            preferredStart <
            freeEnd
        ) {
            const preferredEnd =
                addMinutes(
                    preferredStart,
                    durationInMinutes,
                );

            if (
                preferredEnd <=
                freeEnd
            ) {
                candidates.push({
                    startAtUTC:
                        new Date(
                            preferredStart,
                        ),

                    endAtUTC:
                    preferredEnd,
                });
            }
        }
    }

    /*
     * Remove duplicate start times.
     *
     * This can happen when preferredStart is exactly the
     * beginning of a free interval.
     */
    const uniqueCandidates =
        new Map<
            number,
            SchedulingInterval
        >();

    for (
        const candidate of candidates
        ) {
        const startTime =
            candidate.startAtUTC.getTime();

        if (
            !uniqueCandidates.has(
                startTime,
            )
        ) {
            uniqueCandidates.set(
                startTime,
                candidate,
            );
        }
    }

    /*
     * Nearest absolute time first.
     *
     * Example:
     *
     * requested = 08:00
     *
     * 07:58 -> 2 minutes
     * 08:05 -> 5 minutes
     *
     * Therefore 07:58 comes first.
     *
     * If two candidates have exactly the same distance,
     * prefer the earlier candidate.
     */
    return Array.from(
        uniqueCandidates.values(),
    ).sort((a, b) => {
        const distanceA =
            Math.abs(
                a.startAtUTC.getTime() -
                preferredStart.getTime(),
            );

        const distanceB =
            Math.abs(
                b.startAtUTC.getTime() -
                preferredStart.getTime(),
            );

        if (
            distanceA !==
            distanceB
        ) {
            return (
                distanceA -
                distanceB
            );
        }

        return (
            a.startAtUTC.getTime() -
            b.startAtUTC.getTime()
        );
    });
}

export async function getAvailableTimes(
    organizationUuid: string,
    request: SchedulingRequest,
): Promise<SchedulingResponse> {
    /*
     * Reuse the existing organization service.
     *
     * The organization response contains the location timezone,
     * which is required to interpret working hours.
     */
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

    const organizationTimeZone =
        organization.location.timezone;

    if (
        !organizationTimeZone
    ) {
        throw new Error(
            "Organization timezone is required for scheduling",
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
     *
     * NEAREST:
     * Search all active workers in the organization.
     */
    let workers;

    if (
        request.timeType ===
        AppointmentTimeType.WORKER
    ) {
        workers = [
            await getUser(
                request.workerUuid as string,
            ),
        ];
    } else {
        workers = await getUsers({
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

    /*
     * fromAtUTC is an actual instant and acts as the
     * preferred scheduling time.
     *
     * IMPORTANT:
     *
     * It is NOT a lower bound anymore.
     *
     * A valid appointment before fromAtUTC can be returned.
     *
     * Example:
     *
     * requested: 08:00
     * available: 07:58, 08:05
     *
     * 07:58 is selected first.
     */
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
     * Store options independently for every worker.
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
     * Convert the starting instant to the organization's
     * local calendar date before searching calendar days.
     *
     * Do NOT use:
     *
     * fromAtUTC.toISOString().substring(0, 10)
     *
     * because that uses the UTC calendar date.
     */
    const firstDateString =
        getLocalDate(
            fromAtUTC,
            organizationTimeZone,
        );

    /*
     * Search up to 30 organization-local calendar days.
     */
    for (
        let dayOffset = 0;
        dayOffset < SEARCH_DAYS;
        dayOffset++
    ) {
        const dateString =
            addCalendarDays(
                firstDateString,
                dayOffset,
            );

        /*
         * Skip organization-wide special days.
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
            specialDays.length > 0
        ) {
            continue;
        }

        /*
         * Working hours are defined by the organization's
         * local weekday.
         */
        const dayOfWeek =
            getDayOfWeek(
                dateString,
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

        /*
         * Convert local wall-clock working hours to UTC instants.
         */
        const workingStart =
            getWorkingDateTime(
                dateString,
                todayWorkingHours.startTime,
                organizationTimeZone,
            );

        const workingEnd =
            getWorkingDateTime(
                dateString,
                todayWorkingHours.endTime,
                organizationTimeZone,
            );

        if (
            workingStart >=
            workingEnd
        ) {
            continue;
        }

        /*
         * IMPORTANT:
         *
         * Search the WHOLE working interval.
         *
         * fromAtUTC is only the preferred/reference time.
         *
         * This is what allows a candidate such as 07:58 to
         * compete with 08:05 when the requested time is 08:00.
         */
        const searchStart =
            new Date(workingStart);

        if (
            searchStart >=
            workingEnd
        ) {
            continue;
        }

        /*
         * Search every worker independently.
         */
        for (
            const worker of workers
            ) {
            const currentWorkerOptions =
                workerOptions.get(
                    worker.uuid,
                ) ?? [];

            /*
             * This worker already has enough options.
             */
            if (
                currentWorkerOptions.length >=
                OPTIONS_PER_WORKER
            ) {
                continue;
            }

            /*
             * Only rooms assigned to this worker can be used.
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
             * Collect this day's candidates across all rooms.
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

                /*
                 * Get all known blocking intervals for this
                 * worker/room/customer during this working period.
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

                const candidates =
                    findAvailableCandidates(
                        searchStart,
                        workingEnd,
                        service.durationInMinutes,
                        blockingIntervals,
                        fromAtUTC,
                    );

                /*
                 * Candidates are already ordered by absolute
                 * distance from the requested time.
                 */
                for (
                    const candidate of candidates
                    ) {
                    /*
                     * We may have enough candidates after
                     * considering this room.
                     */
                    if (
                        workerDayOptions.length >=
                        OPTIONS_PER_WORKER
                    ) {
                        break;
                    }

                    /*
                     * Final database conflict check.
                     */
                    const conflict =
                        await schedulingRepository
                            .hasConflict(
                                organizationId,
                                workerId,
                                roomId,
                                request.userId,
                                candidate.startAtUTC.toISOString(),
                                candidate.endAtUTC.toISOString(),
                            );

                    if (
                        conflict
                    ) {
                        continue;
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
                     * Do not return the same start time twice
                     * for this worker, even if multiple rooms
                     * can provide it.
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

                    workerDayOptions.push(
                        option,
                    );
                }
            }

            /*
             * Combine all room candidates and order them by
             * absolute distance from the requested time.
             *
             * Earlier time wins when the distance is equal.
             */
            workerDayOptions.sort(
                (a, b) => {
                    const startA =
                        new Date(
                            a.scheduledStartAtUTC,
                        ).getTime();

                    const startB =
                        new Date(
                            b.scheduledStartAtUTC,
                        ).getTime();

                    const distanceA =
                        Math.abs(
                            startA -
                            fromAtUTC.getTime(),
                        );

                    const distanceB =
                        Math.abs(
                            startB -
                            fromAtUTC.getTime(),
                        );

                    if (
                        distanceA !==
                        distanceB
                    ) {
                        return (
                            distanceA -
                            distanceB
                        );
                    }

                    return (
                        startA -
                        startB
                    );
                },
            );

            /*
             * Add only enough options to reach three.
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

            /*
             * Keep the worker's accumulated options ordered
             * by absolute distance from the requested time.
             *
             * This is important when options come from multiple
             * calendar days.
             */
            currentWorkerOptions.sort(
                (a, b) => {
                    const startA =
                        new Date(
                            a.scheduledStartAtUTC,
                        ).getTime();

                    const startB =
                        new Date(
                            b.scheduledStartAtUTC,
                        ).getTime();

                    const distanceA =
                        Math.abs(
                            startA -
                            fromAtUTC.getTime(),
                        );

                    const distanceB =
                        Math.abs(
                            startB -
                            fromAtUTC.getTime(),
                        );

                    if (
                        distanceA !==
                        distanceB
                    ) {
                        return (
                            distanceA -
                            distanceB
                        );
                    }

                    return (
                        startA -
                        startB
                    );
                },
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
         * Stop as soon as every worker has three options.
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
     * Workers with no availability are excluded.
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
                            (a, b) => {
                                const startA =
                                    new Date(
                                        a.scheduledStartAtUTC,
                                    ).getTime();

                                const startB =
                                    new Date(
                                        b.scheduledStartAtUTC,
                                    ).getTime();

                                const distanceA =
                                    Math.abs(
                                        startA -
                                        fromAtUTC.getTime(),
                                    );

                                const distanceB =
                                    Math.abs(
                                        startB -
                                        fromAtUTC.getTime(),
                                    );

                                if (
                                    distanceA !==
                                    distanceB
                                ) {
                                    return (
                                        distanceA -
                                        distanceB
                                    );
                                }

                                return (
                                    startA -
                                    startB
                                );
                            },
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