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

interface SchedulingInterval {
    startAtUTC: Date;
    endAtUTC: Date;
}

function parseDate(value: string): Date {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid UTC date: ${value}`);
    }

    return date;
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
        const startDate = parseDate(startAtUTC);
        const endDate = parseDate(endAtUTC);

        /*
         * Appointment timestamps use Date in the Drizzle schema,
         * so comparisons use Date objects.
         */
        const appointments = await drizzleConnection
            .select({
                startAtUTC: appointmentTable.scheduledStartAtUTC,
                endAtUTC: appointmentTable.scheduledEndAtUTC,
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

                    /*
                     * Appointment starts before the searched
                     * period ends.
                     */
                    lt(
                        appointmentTable.scheduledStartAtUTC,
                        endDate,
                    ),

                    /*
                     * Appointment ends after the searched
                     * period starts.
                     */
                    gt(
                        appointmentTable.scheduledEndAtUTC,
                        startDate,
                    ),

                    /*
                     * The appointment blocks:
                     *
                     * - this worker
                     * - this room
                     * - this customer
                     */
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

        /*
         * timeBlockTable uses:
         *
         * timestamp(..., { mode: "string" })
         *
         * Therefore Drizzle expects strings here, not Date objects.
         *
         * A worker's approved time block blocks that worker.
         * Since that worker cannot work during the block, the room
         * assigned to that worker is also unavailable during it.
         */
        const timeBlocks = await drizzleConnection
            .select({
                startAtUTC: timeBlockTable.startAtUTC,
                endAtUTC: timeBlockTable.endAtUTC,
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

                    /*
                     * The time block belongs to this worker.
                     *
                     * This indirectly blocks the worker's assigned
                     * room as well.
                     */
                    eq(
                        timeBlockTable.requestUserId,
                        workerId,
                    ),

                    /*
                     * timeBlockTable timestamps are strings.
                     */
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
            ...appointments.map((appointment) => ({
                startAtUTC: new Date(
                    appointment.startAtUTC,
                ),
                endAtUTC: new Date(
                    appointment.endAtUTC,
                ),
            })),

            ...timeBlocks.map((timeBlock) => ({
                startAtUTC: new Date(
                    timeBlock.startAtUTC,
                ),
                endAtUTC: new Date(
                    timeBlock.endAtUTC,
                ),
            })),
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
        const startDate = parseDate(startAtUTC);
        const endDate = parseDate(endAtUTC);

        const appointment = await drizzleConnection
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

                    /*
                     * The appointment conflicts if it uses:
                     *
                     * - the worker
                     * - the room
                     * - the customer
                     */
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

        /*
         * An approved worker time block blocks the worker.
         *
         * Because the room is assigned to this worker, it also
         * makes that worker's room unavailable during the block.
         */
        const timeBlock = await drizzleConnection
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

                    eq(
                        timeBlockTable.requestUserId,
                        workerId,
                    ),

                    /*
                     * These columns are mode: "string",
                     * so compare against the original strings.
                     */
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