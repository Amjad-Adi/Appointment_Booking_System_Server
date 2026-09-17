import {
    and,
    eq,
    gt,
    inArray,
    lt,
    or,
} from "drizzle-orm";

import { drizzleConnection } from "../databases/drizzle-connection.js";

import {
    appointmentTable,
} from "../drizzle-schemas/appointment.db.js";

import {
    timeBlockTable,
} from "../drizzle-schemas/time-block.db.js";

import {
    TimeBlockStatus,
} from "../models/enums/time-block-status.js";

import {
    ACTIVE_APPOINTMENT_STATUSES,
} from "../models/appointment.model.js";

interface SchedulingInterval {
    startAtUTC: Date;
    endAtUTC: Date;
}

function parseDate(
    value: string,
): Date {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        throw new Error(
            `Invalid UTC date: ${value}`,
        );
    }

    return date;
}

function isValidInterval(
    startAtUTC: Date,
    endAtUTC: Date,
): boolean {
    return (
        startAtUTC.getTime() <
        endAtUTC.getTime()
    );
}

export const schedulingRepository = {
    async findBlockingIntervals(
        organizationId: number,
        workerId: number,
        roomId: number,
        userId: number,
        startAtUTC: string,
        endAtUTC: string,
    ): Promise<SchedulingInterval[]> {
        const startDate =
            parseDate(
                startAtUTC,
            );

        const endDate =
            parseDate(
                endAtUTC,
            );

        if (
            startDate >=
            endDate
        ) {
            return [];
        }

        /*
         * Appointments block the schedule when their intervals
         * overlap the searched interval.
         *
         * Interval rule:
         *
         * appointment.start < search.end
         * AND
         * appointment.end > search.start
         *
         * Therefore:
         *
         * 10:00–10:30
         * 10:30–11:00
         *
         * do NOT conflict.
         */
        const appointments =
            await drizzleConnection
                .select({
                    startAtUTC:
                    appointmentTable
                        .scheduledStartAtUTC,

                    endAtUTC:
                    appointmentTable
                        .scheduledEndAtUTC,
                })
                .from(
                    appointmentTable,
                )
                .where(
                    and(
                        eq(
                            appointmentTable
                                .organizationId,
                            organizationId,
                        ),

                        inArray(
                            appointmentTable
                                .appointmentStatus,
                            ACTIVE_APPOINTMENT_STATUSES,
                        ),

                        lt(
                            appointmentTable
                                .scheduledStartAtUTC,
                            endDate,
                        ),

                        gt(
                            appointmentTable
                                .scheduledEndAtUTC,
                            startDate,
                        ),

                        /*
                         * The appointment blocks the schedule
                         * when it uses the same:
                         *
                         * - worker
                         * - room
                         * - customer
                         */
                        or(
                            eq(
                                appointmentTable
                                    .workerId,
                                workerId,
                            ),

                            eq(
                                appointmentTable
                                    .roomId,
                                roomId,
                            ),

                            eq(
                                appointmentTable
                                    .userId,
                                userId,
                            ),
                        ),
                    ),
                )
                .orderBy(
                    appointmentTable
                        .scheduledStartAtUTC,
                );

        /*
         * timeBlockTable stores its timestamps as strings
         * according to the current Drizzle schema.
         *
         * Do NOT pass Date objects to these comparisons.
         */
        const timeBlocks =
            await drizzleConnection
                .select({
                    startAtUTC:
                    timeBlockTable
                        .startAtUTC,

                    endAtUTC:
                    timeBlockTable
                        .endAtUTC,
                })
                .from(
                    timeBlockTable,
                )
                .where(
                    and(
                        eq(
                            timeBlockTable
                                .organizationId,
                            organizationId,
                        ),

                        eq(
                            timeBlockTable
                                .requestStatus,
                            TimeBlockStatus.APPROVED,
                        ),

                        /*
                         * This worker's approved time block
                         * makes the worker unavailable.
                         */
                        eq(
                            timeBlockTable
                                .requestUserId,
                            workerId,
                        ),

                        lt(
                            timeBlockTable
                                .startAtUTC,
                            endAtUTC,
                        ),

                        gt(
                            timeBlockTable
                                .endAtUTC,
                            startAtUTC,
                        ),
                    ),
                )
                .orderBy(
                    timeBlockTable
                        .startAtUTC,
                );

        const intervals:
            SchedulingInterval[] = [];

        for (
            const appointment of appointments
            ) {
            const start =
                new Date(
                    appointment.startAtUTC,
                );

            const end =
                new Date(
                    appointment.endAtUTC,
                );

            if (
                isValidInterval(
                    start,
                    end,
                )
            ) {
                intervals.push({
                    startAtUTC:
                    start,

                    endAtUTC:
                    end,
                });
            }
        }

        for (
            const timeBlock of timeBlocks
            ) {
            const start =
                new Date(
                    timeBlock.startAtUTC,
                );

            const end =
                new Date(
                    timeBlock.endAtUTC,
                );

            if (
                isValidInterval(
                    start,
                    end,
                )
            ) {
                intervals.push({
                    startAtUTC:
                    start,

                    endAtUTC:
                    end,
                });
            }
        }

        intervals.sort(
            (a, b) =>
                a.startAtUTC.getTime() -
                b.startAtUTC.getTime(),
        );

        return intervals;
    },

    async hasConflict(
        organizationId: number,
        workerId: number,
        roomId: number,
        userId: number,
        startAtUTC: string,
        endAtUTC: string,
    ): Promise<boolean> {
        const startDate =
            parseDate(
                startAtUTC,
            );

        const endDate =
            parseDate(
                endAtUTC,
            );

        if (
            startDate >=
            endDate
        ) {
            return true;
        }

        /*
         * Check appointment conflicts.
         */
        const appointments =
            await drizzleConnection
                .select({
                    id:
                    appointmentTable.id,
                })
                .from(
                    appointmentTable,
                )
                .where(
                    and(
                        eq(
                            appointmentTable
                                .organizationId,
                            organizationId,
                        ),

                        inArray(
                            appointmentTable
                                .appointmentStatus,
                            ACTIVE_APPOINTMENT_STATUSES,
                        ),

                        lt(
                            appointmentTable
                                .scheduledStartAtUTC,
                            endDate,
                        ),

                        gt(
                            appointmentTable
                                .scheduledEndAtUTC,
                            startDate,
                        ),

                        or(
                            eq(
                                appointmentTable
                                    .workerId,
                                workerId,
                            ),

                            eq(
                                appointmentTable
                                    .roomId,
                                roomId,
                            ),

                            eq(
                                appointmentTable
                                    .userId,
                                userId,
                            ),
                        ),
                    ),
                )
                .limit(1);

        if (
            appointments.length > 0
        ) {
            return true;
        }

        /*
         * Check approved worker time blocks.
         *
         * The room assigned to the worker is unavailable while
         * the worker is blocked.
         */
        const timeBlocks =
            await drizzleConnection
                .select({
                    id:
                    timeBlockTable.id,
                })
                .from(
                    timeBlockTable,
                )
                .where(
                    and(
                        eq(
                            timeBlockTable
                                .organizationId,
                            organizationId,
                        ),

                        eq(
                            timeBlockTable
                                .requestStatus,
                            TimeBlockStatus.APPROVED,
                        ),

                        eq(
                            timeBlockTable
                                .requestUserId,
                            workerId,
                        ),

                        lt(
                            timeBlockTable
                                .startAtUTC,
                            endAtUTC,
                        ),

                        gt(
                            timeBlockTable
                                .endAtUTC,
                            startAtUTC,
                        ),
                    ),
                )
                .limit(1);

        return timeBlocks.length > 0;
    },
};