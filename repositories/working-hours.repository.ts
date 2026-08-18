import {drizzleConnection} from "../databases/drizzle-connection";
import {organizationTable} from "../databases/drizzle-schemas/organizations.db";
import {and, eq} from "drizzle-orm";
import {CreateWorkingHours, UpdateWorkingHours, WorkingHours} from "../models/working-hours.model";
import {workingHoursTable} from "../databases/drizzle-schemas/working-hours.db";
import {DayOfWeek} from "../models/enums/day-of-week";

export async function findAll(organizationUuid:string):Promise<WorkingHours[]>{
    return await drizzleConnection
        .select({uuid:workingHoursTable.uuid,dayOfWeek:workingHoursTable.dayOfWeek,startTime:workingHoursTable.startTimeUTC,endTime:workingHoursTable.startTimeUTC})
        .from(workingHoursTable)
        .innerJoin(organizationTable,eq(workingHoursTable.organizationId,organizationTable.id))
        .where(eq(organizationTable.uuid,organizationUuid))
}

export async function findByUuid(organizationUuid:string,workingHoursUuid:string):Promise<WorkingHours>{
    return (await drizzleConnection
        .select({uuid:workingHoursTable.uuid,dayOfWeek:workingHoursTable.dayOfWeek,startTime:workingHoursTable.startTimeUTC,endTime:workingHoursTable.endTimeUTC})
        .from(workingHoursTable)
        .innerJoin(organizationTable,eq(workingHoursTable.organizationId,organizationTable.id))
        .where(and(eq(organizationTable.uuid,organizationUuid),eq(workingHoursTable.uuid,workingHoursUuid))))[0]
}


export async function createWorkingDays(arrayOfWorkingDays: CreateWorkingHours[]):Promise<void> {
    await drizzleConnection
        .insert(workingHoursTable)
        .values(arrayOfWorkingDays)
}

export async function update(workingHours: UpdateWorkingHours):Promise<WorkingHours> {
    return (await drizzleConnection
        .update(workingHoursTable)
        .set({startTimeUTC:workingHours.startTimeUTC,endTimeUTC:workingHoursTable.endTimeUTC})
        .where(eq(workingHoursTable.uuid,workingHours.uuid))
        .returning({uuid:workingHoursTable.uuid,dayOfWeek:workingHoursTable.dayOfWeek,startTime:workingHoursTable.startTimeUTC,endTime:workingHoursTable.endTimeUTC}))[0]
}

export async function findTodayWorkingHours(organizationUuid:string,day:DayOfWeek){
    return (await drizzleConnection
        .select({uuid:workingHoursTable.uuid,dayOfWeek:workingHoursTable.dayOfWeek,startTime:workingHoursTable.startTimeUTC,endTime:workingHoursTable.endTimeUTC})
        .from(workingHoursTable)
        .innerJoin(organizationTable,eq(workingHoursTable.organizationId,organizationTable.id))
        .where(and(eq(organizationTable.uuid,organizationUuid),eq(workingHoursTable.dayOfWeek,day))))[0]
}

