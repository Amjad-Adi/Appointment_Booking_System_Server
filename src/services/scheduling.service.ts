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

    /*
     * Initially interpret the local components as if they were UTC.
     *
     * This gives us a "naive UTC" value from which the timezone
     * offset can be calculated.
     */
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

    /*
     * Apply the timezone offset.
     */
    let result =
        new Date(
            naiveUTC.getTime() -
            getTimeZoneOffset(
                naiveUTC,
                timeZone,
            ),
        );

    /*
     * Recalculate after applying the first offset.
     *
     * This matters around DST transitions because the offset that
     * applies to the resulting instant can differ from the offset
     * calculated from the naive value.
     */
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
 *
 * Example:
 *
 * 2026-09-16T22:30:00Z
 * Asia/Jerusalem
 * -> 2026-09-17
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
    /*
     * PostgreSQL TIME may be returned as HH:mm:ss.
     *
     * Keep only the HH:mm:ss portion.
     */
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
 * Finds appointment candidates inside the free portions
 * of a working interval.
 *
 * No artificial 5/15/30-minute calendar grid is used.
 *
 * The first candidate in each free interval starts at the
 * beginning of that free interval. Subsequent candidates
 * advance by the actual service duration.
 *
 * Example:
 *
 * working period: 08:00–13:00
 * blocked:        09:00–10:00
 * duration:       30 minutes
 *
 * candidates:
 *
 * 08:00–08:30
 * 08:30–09:00
 * 10:00–10:30
 * 10:30–11:00
 * ...
 */
function findAvailableCandidates(
    workingStart: Date,
    workingEnd: Date,
    durationInMinutes: number,
    blockingIntervals: SchedulingInterval[],
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

    let candidateStart =
        new Date(workingStart);

    for (
        const blockingInterval of mergedIntervals
        ) {
        /*
         * Ignore blocks completely before the current pointer.
         */
        if (
            blockingInterval.endAtUTC <=
            candidateStart
        ) {
            continue;
        }

        /*
         * If the blocking interval starts after the current
         * candidate pointer, generate candidates in the free gap.
         */
        while (
            candidateStart <
            blockingInterval.startAtUTC
            ) {
            const candidateEnd =
                addMinutes(
                    candidateStart,
                    durationInMinutes,
                );

            /*
             * The service must fit completely before the block.
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
         * Move past the blocking interval.
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
            break;
        }
    }

    /*
     * Generate candidates in the final free interval.
     */
    while (
        candidateStart <
        workingEnd
        ) {
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
     * fromAtUTC is an actual instant.
     *
     * For NEAREST mode the frontend already converts the
     * organization's local input into UTC.
     *
     * If omitted, use the current instant.
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
     * IMPORTANT:
     *
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
         * On the first organization-local day, never return an
         * appointment beginning before fromAtUTC.
         */
        let searchStart =
            new Date(workingStart);

        if (
            dayOffset === 0 &&
            fromAtUTC >
            searchStart
        ) {
            searchStart =
                new Date(fromAtUTC);
        }

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
                if (
                    workerDayOptions.length >=
                    OPTIONS_PER_WORKER
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
                    );

                for (
                    const candidate of candidates
                    ) {
                    if (
                        workerDayOptions.length >=
                        OPTIONS_PER_WORKER
                    ) {
                        break;
                    }

                    /*
                     * The candidate has already been derived from
                     * the blocking intervals, but perform the final
                     * conflict check before returning it.
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
                     * Do not return the same start time twice for
                     * this worker, even if multiple rooms can provide it.
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
             * Earliest options first.
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