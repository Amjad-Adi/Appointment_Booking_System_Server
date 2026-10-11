import { and, eq, gt, inArray, lt, or,} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { drizzleConnection } from "../databases/drizzle-connection";
import { appointmentTable } from "../drizzle-schemas/appointment.db";
import { organizationTable } from "../drizzle-schemas/organizations.db";
import { roomTable } from "../drizzle-schemas/rooms.db";
import { timeBlockTable } from "../drizzle-schemas/time-block.db";
import { usersTable } from "../drizzle-schemas/users.db";
import { TimeBlockStatus } from "../models/enums/time-block-status";
import { ACTIVE_APPOINTMENT_STATUSES } from "../models/appointment.model";
import { SchedulingInterval } from '../models/scheduling.model';

function parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid UTC date: ${value}`);
    }
    return date;
}

function isValidInterval(startAtUTC: Date, endAtUTC: Date): boolean {
    return startAtUTC.getTime() < endAtUTC.getTime();
}

export async function findBlockingIntervals(organizationUuid: string, workerUuid: string, roomUuid: string, userUuid: string, startAtUTC: string, endAtUTC: string,): Promise<SchedulingInterval[]> {
    const startDate = parseDate(startAtUTC);
    const endDate = parseDate(endAtUTC);
    if (startDate >= endDate) {
        return [];
    }
    const normalizedStart = startDate.toISOString();
    const normalizedEnd = endDate.toISOString();
    const targetWorker = alias(usersTable, "target_worker");
    const targetRoom = alias(roomTable, "target_room");
    const [appointments, timeBlocks] = await Promise.all([
        drizzleConnection
            .select({ startAtUTC: appointmentTable.scheduledStartAtUTC, endAtUTC: appointmentTable.scheduledEndAtUTC, })
            .from(appointmentTable)
            .innerJoin(organizationTable, eq(appointmentTable.organizationId, organizationTable.id),)
            .innerJoin(targetWorker, and(eq(targetWorker.uuid, workerUuid), eq(targetWorker.organizationId, organizationTable.id),),)
            .innerJoin(targetRoom, and(eq(targetRoom.uuid, roomUuid), eq(targetRoom.organizationId, organizationTable.id),),)
            .where(and(eq(organizationTable.uuid, organizationUuid), inArray(appointmentTable.appointmentStatus, ACTIVE_APPOINTMENT_STATUSES), lt(appointmentTable.scheduledStartAtUTC, normalizedEnd), gt(appointmentTable.scheduledEndAtUTC, normalizedStart), or(eq(appointmentTable.workerId, targetWorker.id), eq(appointmentTable.roomId, targetRoom.id), eq(appointmentTable.userId, drizzleConnection.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.uuid, userUuid))),),),)
            .orderBy(appointmentTable.scheduledStartAtUTC),
        drizzleConnection.select({ startAtUTC: timeBlockTable.startAtUTC, endAtUTC: timeBlockTable.endAtUTC, })
            .from(timeBlockTable)
            .innerJoin(organizationTable, eq(timeBlockTable.organizationId, organizationTable.id),)
            .innerJoin(targetWorker, and(eq(targetWorker.uuid, workerUuid), eq(targetWorker.organizationId, organizationTable.id),),)
            .where(and(eq(organizationTable.uuid, organizationUuid), eq(timeBlockTable.requestStatus, TimeBlockStatus.APPROVED), eq(timeBlockTable.requestUserId, targetWorker.id), lt(timeBlockTable.startAtUTC, normalizedEnd), gt(timeBlockTable.endAtUTC, normalizedStart)),)
            .orderBy(timeBlockTable.startAtUTC)]);
    const intervals: SchedulingInterval[] = [];
    for (const appointment of appointments) {
        const start = new Date(appointment.startAtUTC);
        const end = new Date(appointment.endAtUTC);
        if (isValidInterval(start, end)) {
            intervals.push({
                startAtUTC: start,
                endAtUTC: end,
            });
        }
    }
    for (const timeBlock of timeBlocks) {
        const start = new Date(timeBlock.startAtUTC);
        const end = new Date(timeBlock.endAtUTC);
        if (isValidInterval(start, end)) {
            intervals.push({ startAtUTC: start, endAtUTC: end, });
        }
    }
    intervals.sort((a, b) => a.startAtUTC.getTime() - b.startAtUTC.getTime(),);
    return intervals;
}