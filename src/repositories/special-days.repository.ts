import { and, asc, count, desc,eq,gte, ilike, lte, or, } from "drizzle-orm";
import { drizzleConnection } from "../databases/drizzle-connection";
import { specialDaysTable } from "../drizzle-schemas/special-days.db";
import type { CreateSpecialDay, QuerySpecialDay, SpecialDay, SpecialDayResponse, UpdateSpecialDay, } from "../models/special-days.model";
import { SORT_BY_CREATED_AT_UTC, SORT_BY_DAY_DATE, SORT_BY_NAME, SORT_BY_UPDATED_AT_UTC, } from "../databases/contracts/special-days.contract";
import { Order } from '../models/enums/order';
import { organizationTable } from '../drizzle-schemas/organizations.db';
import { mapDatabaseError } from '../utils/map/map-database-error';

export async function findAll(query: QuerySpecialDay): Promise<SpecialDayResponse[]> {
    const { search, filter, sortBy, order, limit, offset } = query;
    const conditions = [eq(organizationTable.uuid, query.filter?.organizationUuid as string)];
    const sortColumnsDefinition={
        [SORT_BY_NAME]:specialDaysTable.name,
        [SORT_BY_CREATED_AT_UTC]:specialDaysTable.createdAtUTC,
        [SORT_BY_DAY_DATE]:specialDaysTable.dayDate,
        [SORT_BY_UPDATED_AT_UTC]:specialDaysTable.updatedAtUTC,
    }
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push(ilike(specialDaysTable.name, searchValue));
    }
    if (filter?.status) {
        conditions.push(eq(specialDaysTable.status, filter.status))
    }
    if (filter?.fromDate) {
        conditions.push(gte(specialDaysTable.dayDate, filter.fromDate))
    }
    if (filter?.toDate) {
        conditions.push(lte(specialDaysTable.dayDate, filter.toDate));
    }
    const sortColumn = sortColumnsDefinition[sortBy?? SORT_BY_NAME];
    const sortOrder = order?.toUpperCase() === Order.DESC ? desc(sortColumn) : asc(sortColumn);
    return await drizzleConnection
        .select({ uuid: specialDaysTable.uuid, name: specialDaysTable.name,dayDate: specialDaysTable.dayDate, description: specialDaysTable.description, createdAtUTC: specialDaysTable.createdAtUTC, updatedAtUTC: specialDaysTable.updatedAtUTC, status: specialDaysTable.status,organizationUuid:organizationTable.uuid,organizationName:organizationTable.name})
        .from(specialDaysTable)
        .innerJoin(organizationTable,eq(organizationTable.id,specialDaysTable.organizationId))
        .where(and(...conditions))
        .orderBy(sortOrder, asc(specialDaysTable.uuid))
        .limit(limit)
        .offset(offset as number);
}

export async function countAll(query: QuerySpecialDay): Promise<number> {
    const { search, filter} = query;
    const conditions = [eq(organizationTable.uuid, query.filter?.organizationUuid as string)];
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push(ilike(specialDaysTable.name, searchValue));
    }
    if (filter?.status) {
        conditions.push(eq(specialDaysTable.status, filter.status))
    }
    if (filter?.fromDate) {
        conditions.push(gte(specialDaysTable.dayDate, filter.fromDate))
    }
    if (filter?.toDate) {
        conditions.push(lte(specialDaysTable.dayDate, filter.toDate));
    }
    const [result] = await drizzleConnection.select({ totalNumberOfSpecialDays: count()})
        .from(specialDaysTable)
        .where(and(...conditions));
    return result.totalNumberOfSpecialDays;
}

export async function findByUuid(specialDayUuid: string, organizationUuid: string): Promise<SpecialDayResponse> {
    const [result] = await drizzleConnection
        .select({ uuid: specialDaysTable.uuid, name: specialDaysTable.name,dayDate: specialDaysTable.dayDate, description: specialDaysTable.description, createdAtUTC: specialDaysTable.createdAtUTC, updatedAtUTC: specialDaysTable.updatedAtUTC, status: specialDaysTable.status,organizationUuid:organizationTable.uuid,organizationName:organizationTable.name})
        .from(specialDaysTable)
        .innerJoin(organizationTable,eq(organizationTable.id,specialDaysTable.organizationId))
        .where(and(eq(specialDaysTable.uuid, specialDayUuid), eq(organizationTable.uuid, organizationUuid)));
    return result
}

export async function create(specialDay: CreateSpecialDay): Promise<SpecialDay> {
    try{
        const [result] = await drizzleConnection
            .insert(specialDaysTable)
            .values({ name: specialDay.name, dayDate: specialDay.dayDate, description: specialDay.description ?? null, organizationId: specialDay.organizationId})
            .returning({ uuid: specialDaysTable.uuid, name: specialDaysTable.name,dayDate: specialDaysTable.dayDate, description: specialDaysTable.description, createdAtUTC: specialDaysTable.createdAtUTC, updatedAtUTC: specialDaysTable.updatedAtUTC, status: specialDaysTable.status})
        return result
    }catch(error){
        mapDatabaseError(error);
    }
}

export async function update(specialDay: UpdateSpecialDay): Promise<SpecialDay> {
    try{
        const [result] = await drizzleConnection
            .update(specialDaysTable)
            .set({
                ...(specialDay.name !== undefined && { name: specialDay.name}),
                ...(specialDay.dayDate !== undefined && { dayDate: specialDay.dayDate }),
                ...(specialDay.description !== undefined && { description: specialDay.description }),
                ...(specialDay.status !== undefined && { status: specialDay.status}),
                updatedAtUTC: new Date()})
            .where(and(eq(specialDaysTable.uuid, specialDay.uuid), eq(specialDaysTable.organizationId, specialDay.organizationId)))
            .returning({ uuid: specialDaysTable.uuid, name: specialDaysTable.name,dayDate: specialDaysTable.dayDate, description: specialDaysTable.description, createdAtUTC: specialDaysTable.createdAtUTC, updatedAtUTC: specialDaysTable.updatedAtUTC, status: specialDaysTable.status})
        return result
    }catch(error){
        mapDatabaseError(error);
    }
}