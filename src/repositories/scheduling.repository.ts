import {
    and,
    eq,
    gt,
    inArray,
    lt,
    or,
} from "drizzle-orm";

import { drizzleConnection } from "../databases/drizzle-connection.js";

import { appointmentTable } from "../drizzle-schemas/appointment.db.js";
import { timeBlockTable } from "../drizzle-schemas/time-block.db.js";

import { TimeBlockStatus } from "../models/enums/time-block-status.js";
import { ACTIVE_APPOINTMENT_STATUSES } from "../models/appointment.model.js";

export const schedulingRepository = {

    async findBlockingIntervals(
        organizationId: number,
        workerId: number,
        roomId: number,
        userId: number,
        startAtUTC: string,
        endAtUTC: string,
    ): Promise<{
        startAtUTC: Date;
        endAtUTC: Date;
    }[]> {

        const startDate = new Date(startAtUTC);
        const endDate = new Date(endAtUTC);

        const appointments =
            await drizzleConnection
                .select({
                    startAtUTC:
                    appointmentTable.scheduledStartAtUTC,

                    endAtUTC:
                    appointmentTable.scheduledEndAtUTC,
                })
                .from(appointmentTable)
                .where(
                    and(
                        eq(
                            appointmentTable.organizationId,
                            organizationId,
                        ),

                        inArray(
                            appointmentTable.appointmentStatus,
                            ACTIVE_APPOINTMENT_STATUSES,
                        ),

                        lt(
                            appointmentTable.scheduledStartAtUTC,
                            endDate,
                        ),

                        gt(
                            appointmentTable.scheduledEndAtUTC,
                            startDate,
                        ),

                        or(
                            eq(
                                appointmentTable.workerId,
                                workerId,
                            ),

                            eq(
                                appointmentTable.roomId,
                                roomId,
                            ),

                            eq(
                                appointmentTable.userId,
                                userId,
                            ),
                        ),
                    ),
                )
                .orderBy(
                    appointmentTable.scheduledStartAtUTC,
                );

        const timeBlocks =
            await drizzleConnection
                .select({
                    startAtUTC:
                    timeBlockTable.startAtUTC,

                    endAtUTC:
                    timeBlockTable.endAtUTC,
                })
                .from(timeBlockTable)
                .where(
                    and(
                        eq(
                            timeBlockTable.organizationId,
                            organizationId,
                        ),

                        eq(
                            timeBlockTable.requestStatus,
                            TimeBlockStatus.APPROVED,
                        ),

                        lt(
                            timeBlockTable.startAtUTC,
                            endAtUTC,
                        ),

                        gt(
                            timeBlockTable.endAtUTC,
                            startAtUTC,
                        ),
                    ),
                )
                .orderBy(
                    timeBlockTable.startAtUTC,
                );

        return [
            ...appointments.map(
                appointment => ({
                    startAtUTC:
                    appointment.startAtUTC,

                    endAtUTC:
                    appointment.endAtUTC,
                }),
            ),

            ...timeBlocks.map(
                timeBlock => ({
                    startAtUTC:
                        new Date(timeBlock.startAtUTC),

                    endAtUTC:
                        new Date(timeBlock.endAtUTC),
                }),
            ),
        ].sort(
            (a, b) =>
                a.startAtUTC.getTime() -
                b.startAtUTC.getTime(),
        );
    },

    async hasConflict(
        organizationId: number,
        workerId: number,
        roomId: number,
        userId: number,
        startAtUTC: string,
        endAtUTC: string,
    ): Promise<boolean> {

        const startDate = new Date(startAtUTC);
        const endDate = new Date(endAtUTC);

        const appointment =
            await drizzleConnection
                .select({
                    id: appointmentTable.id,
                })
                .from(appointmentTable)
                .where(
                    and(
                        eq(
                            appointmentTable.organizationId,
                            organizationId,
                        ),

                        inArray(
                            appointmentTable.appointmentStatus,
                            ACTIVE_APPOINTMENT_STATUSES,
                        ),

                        lt(
                            appointmentTable.scheduledStartAtUTC,
                            endDate,
                        ),

                        gt(
                            appointmentTable.scheduledEndAtUTC,
                            startDate,
                        ),

                        or(
                            eq(
                                appointmentTable.workerId,
                                workerId,
                            ),

                            eq(
                                appointmentTable.roomId,
                                roomId,
                            ),

                            eq(
                                appointmentTable.userId,
                                userId,
                            ),
                        ),
                    ),
                )
                .limit(1);

        if (appointment.length > 0) {
            return true;
        }

        const timeBlock =
            await drizzleConnection
                .select({
                    id: timeBlockTable.id,
                })
                .from(timeBlockTable)
                .where(
                    and(
                        eq(
                            timeBlockTable.organizationId,
                            organizationId,
                        ),

                        eq(
                            timeBlockTable.requestStatus,
                            TimeBlockStatus.APPROVED,
                        ),

                        lt(
                            timeBlockTable.startAtUTC,
                            endAtUTC,
                        ),

                        gt(
                            timeBlockTable.endAtUTC,
                            startAtUTC,
                        ),
                    ),
                )
                .limit(1);

        return timeBlock.length > 0;
    },
};