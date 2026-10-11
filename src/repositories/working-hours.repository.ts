import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { drizzleConnection } from "../databases/drizzle-connection";
import { workingHoursTable } from "../drizzle-schemas/working-hours.db";
import { organizationTable } from "../drizzle-schemas/organizations.db";
import type {
    CreateWorkingHours,
    QueryWorkingHours,
    UpdateWorkingHours,
    UpdateDayWorkingHours,
    WorkingHours,
    WorkingHoursResponse,
} from "../models/working-hours.model";
import { Order } from "../models/enums/order";
import { PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { SORT_BY_DAY_OF_WEEK, SORT_BY_END_TIME, SORT_BY_START_TIME } from '../databases/contracts/working-hours.contract';
import { mapDatabaseError } from '../utils/map/map-database-error';

export async function findAll(query: QueryWorkingHours): Promise<WorkingHoursResponse[]> {
    const { search, filter, sortBy, order, limit, offset } = query;
    const conditions = [eq(organizationTable.uuid, query.filter?.organizationUuid as string)];
    const sortColumnsDefinition = {
        [SORT_BY_DAY_OF_WEEK]: workingHoursTable.dayOfWeek,
        [SORT_BY_START_TIME]: workingHoursTable.startTime,
        [SORT_BY_END_TIME]: workingHoursTable.endTime,
    };
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push(ilike(workingHoursTable.dayOfWeek, searchValue));
    }
    if (filter?.dayOfWeek) {
        conditions.push(eq(workingHoursTable.dayOfWeek, filter.dayOfWeek));
    }
    const sortColumn = sortColumnsDefinition[sortBy ?? SORT_BY_DAY_OF_WEEK];
    const sortOrder = order?.toUpperCase() === Order.DESC ? desc(sortColumn) : asc(sortColumn);
    return await drizzleConnection
        .select({ uuid: workingHoursTable.uuid, dayOfWeek: workingHoursTable.dayOfWeek, startTime: workingHoursTable.startTime, endTime: workingHoursTable.endTime, organizationUuid: organizationTable.uuid,organizationName: organizationTable.name })
        .from(workingHoursTable)
        .innerJoin(organizationTable, eq(organizationTable.id, workingHoursTable.organizationId))
        .where(and(...conditions))
        .orderBy(sortOrder, asc(workingHoursTable.uuid))
        .limit(limit)
        .offset(offset as number);
}

export async function countAll(query: QueryWorkingHours): Promise<number> {
    const { search, filter} = query;
    const conditions = [eq(organizationTable.uuid, query.filter?.organizationUuid as string)];
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push(ilike(workingHoursTable.dayOfWeek, searchValue));
    }
    if (filter?.dayOfWeek) {
        conditions.push(eq(workingHoursTable.dayOfWeek, filter.dayOfWeek));
    }
    const [result] = await drizzleConnection
        .select({ totalNumberOfWorkingHours: count(), })
        .from(workingHoursTable)
        .innerJoin(organizationTable, eq(organizationTable.id, workingHoursTable.organizationId),)
        .where(and(...conditions));
    return result.totalNumberOfWorkingHours;
}

export async function findByUuid(workingHoursUuid: string, organizationUuid: string): Promise<WorkingHoursResponse> {
    const [result] = await drizzleConnection
        .select({ uuid: workingHoursTable.uuid, dayOfWeek: workingHoursTable.dayOfWeek, startTime: workingHoursTable.startTime, endTime: workingHoursTable.endTime, organizationUuid: organizationTable.uuid,organizationName: organizationTable.name })
        .from(workingHoursTable)
        .innerJoin(organizationTable, eq(organizationTable.id, workingHoursTable.organizationId))
        .where(and(eq(workingHoursTable.uuid, workingHoursUuid), eq(organizationTable.uuid, organizationUuid)),);
    return result;
}

export async function createWorkingDays(workingDays: CreateWorkingHours[], client?: PoolClient): Promise<WorkingHours[]> {
    const db = client ? drizzle(client) : drizzleConnection;
    try{
        return await db
            .insert(workingHoursTable)
            .values(workingDays)
            .onConflictDoNothing({ target: [workingHoursTable.organizationId,workingHoursTable.dayOfWeek]})
            .returning({uuid: workingHoursTable.uuid, dayOfWeek: workingHoursTable.dayOfWeek, startTime: workingHoursTable.startTime, endTime: workingHoursTable.endTime})
    } catch (error) {
        mapDatabaseError(error)
    }
}

export async function updateDay(workingHours: UpdateDayWorkingHours): Promise<WorkingHours> {
    try{
        const [result] = await drizzleConnection
            .update(workingHoursTable)
            .set({
                ...(workingHours.startTime !== undefined && { startTime: workingHours.startTime}),
                ...(workingHours.endTime !== undefined && { endTime: workingHours.endTime})
            })
            .where(and(eq(workingHoursTable.uuid, workingHours.uuid), eq(workingHoursTable.organizationId, workingHours.organizationId)))
            .returning({uuid: workingHoursTable.uuid, dayOfWeek: workingHoursTable.dayOfWeek, startTime: workingHoursTable.startTime, endTime: workingHoursTable.endTime})
        return result;
    }catch (error) {
        mapDatabaseError(error)
    }
}

export async function updateDays(workingHours: UpdateWorkingHours): Promise<WorkingHours[]> {
    try{
        return await drizzleConnection.transaction(
            async (client) => {
                const updatedDays: WorkingHours[] = [];
                for (const day of workingHours.days) {
                    const [result] = await client
                        .update(workingHoursTable)
                        .set({
                            ...(day.startTime !== undefined && { startTime: day.startTime}),
                            ...(day.endTime !== undefined && { endTime: day.endTime})
                        })
                        .where(and(eq(workingHoursTable.organizationId, workingHours.organizationId), eq(workingHoursTable.dayOfWeek, day.dayOfWeek)))
                        .returning({uuid: workingHoursTable.uuid, dayOfWeek: workingHoursTable.dayOfWeek, startTime: workingHoursTable.startTime, endTime: workingHoursTable.endTime})
                    if (result === undefined) {
                        return updatedDays;
                    }
                    updatedDays.push(result);
                }
                return updatedDays;
            });
    }catch (error){
        mapDatabaseError(error)
    }
}