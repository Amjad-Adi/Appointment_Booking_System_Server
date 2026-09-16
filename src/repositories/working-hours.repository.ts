import {
    and,
    asc,
    desc,
    eq,
    ilike,
    or,
    sql,
} from "drizzle-orm";
import { drizzleConnection } from "../databases/drizzle-connection.js";
import { workingHoursTable } from "../drizzle-schemas/working-hours.db.js";
import { organizationTable } from "../drizzle-schemas/organizations.db.js";
import type {
    CreateWorkingHours,
    QueryWorkingHours,
    UpdateWorkingHours,
    WorkingHours,
    WorkingHoursResponse,
} from "../models/working-hours.model.js";
import { DayOfWeek } from "../models/enums/day-of-week.js";
const workingHoursSelect = {
    uuid: workingHoursTable.uuid,
    dayOfWeek: workingHoursTable.dayOfWeek,
    startTime: workingHoursTable.startTime,
    endTime: workingHoursTable.endTime,
};
const workingHoursResponseSelect = {
    ...workingHoursSelect,

    organizationUuid: organizationTable.uuid,
    organizationName: organizationTable.name,
};

export async function findAll(query: QueryWorkingHours): Promise<WorkingHoursResponse[]> {
    const conditions = [];
    if (query.filter?.organizationUuid) {
        conditions.push(eq(organizationTable.uuid, query.filter.organizationUuid));
    }
    if (query.filter?.dayOfWeek) {
        conditions.push(eq(workingHoursTable.dayOfWeek, query.filter.dayOfWeek));
    }
    if (query.search) {
        conditions.push(ilike(workingHoursTable.dayOfWeek, `%${query.search}%`));
    }
    let orderBy;
    switch (query.sortBy) {
        case "startTime":
            orderBy = query.order?.toUpperCase() === "DESC" ? desc(workingHoursTable.startTime) : asc(workingHoursTable.startTime);
            break;
        case "endTime":
            orderBy = query.order?.toUpperCase() === "DESC" ? desc(workingHoursTable.endTime) : asc(workingHoursTable.endTime);
            break;
        case "dayOfWeek":
        default:
            orderBy = query.order?.toUpperCase() === "DESC" ? desc(workingHoursTable.dayOfWeek) : asc(workingHoursTable.dayOfWeek);
            break;
    }

    return drizzleConnection
        .select(workingHoursResponseSelect)
        .from(workingHoursTable)
        .innerJoin(organizationTable, eq(workingHoursTable.organizationId, organizationTable.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined,)
        .orderBy(orderBy, asc(workingHoursTable.uuid))
        .limit(query.limit)
        .offset(query.offset);
}

export async function countAll(query: QueryWorkingHours): Promise<number> {
    const conditions = [];
    if (query.filter?.organizationUuid) {
        conditions.push(eq(organizationTable.uuid, query.filter.organizationUuid));
    }
    if (query.filter?.dayOfWeek) {
        conditions.push(eq(workingHoursTable.dayOfWeek, query.filter.dayOfWeek));
    }
    if (query.search) {
        conditions.push(ilike(workingHoursTable.dayOfWeek, `%${query.search}%`));
    }
    const result = await drizzleConnection
        .select({count: sql<number>`count(*)`,})
        .from(workingHoursTable)
        .innerJoin(organizationTable, eq(workingHoursTable.organizationId, organizationTable.id,))
        .where(conditions.length > 0 ? and(...conditions) : undefined,)
    return Number(result[0]?.count ?? 0);
}

export async function findByUuid(organizationUuid: string, workingHoursUuid: string,): Promise<WorkingHoursResponse | undefined> {
    return (await drizzleConnection
            .select(workingHoursResponseSelect).from(workingHoursTable)
            .innerJoin(organizationTable, eq(workingHoursTable.organizationId, organizationTable.id))
            .where(and(eq(organizationTable.uuid, organizationUuid,), eq(workingHoursTable.uuid, workingHoursUuid))))[0];
}

export async function createWorkingDays(workingDays: CreateWorkingHours[]): Promise<WorkingHours[]> {
    if (workingDays.length === 0) {
        return [];
    }
    return await drizzleConnection
        .insert(workingHoursTable)
        .values(workingDays)
        .onConflictDoNothing({target: [workingHoursTable.organizationId,workingHoursTable.dayOfWeek]})
        .returning(workingHoursSelect);
}


export async function update(organizationId: number, workingHours: UpdateWorkingHours,): Promise<WorkingHours|null> {
    const updateValues: Partial<typeof workingHoursTable.$inferInsert> = {};
    if (workingHours.startTime !== undefined) {
        updateValues.startTime = workingHours.startTime;
    }
    if (workingHours.endTime !== undefined) {
        updateValues.endTime = workingHours.endTime ;
    }
    if (Object.keys(updateValues).length === 0) {
        return null;
    }
    const [updated] = await drizzleConnection
        .update(workingHoursTable)
        .set(updateValues)
        .where(and(eq(workingHoursTable.uuid, workingHours.uuid), eq(workingHoursTable.organizationId, organizationId,),),)
        .returning(workingHoursSelect);
    return (updated as WorkingHours) ?? null;
}


export async function findTodayWorkingHours(
    organizationUuid: string,
    day: DayOfWeek,
): Promise<WorkingHours | undefined> {
    return (
        await drizzleConnection
            .select(workingHoursSelect)
            .from(workingHoursTable)
            .innerJoin(organizationTable, eq(workingHoursTable.organizationId, organizationTable.id))
            .where(and(eq(organizationTable.uuid, organizationUuid), eq(workingHoursTable.dayOfWeek, day))))[0];
}