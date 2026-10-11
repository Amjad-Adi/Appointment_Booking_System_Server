import { and, asc, count, desc, eq, gt, ilike, lt, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { drizzleConnection } from "../databases/drizzle-connection";
import { timeBlockTable } from "../drizzle-schemas/time-block.db";
import { usersTable } from "../drizzle-schemas/users.db";
import { ALIAS, SECONDARY_ALIAS } from "../databases/contracts/user.contract";
import type { CreateTimeBlock, QueryTimeBlock, TimeBlock, TimeBlockResponse, UpdateTimeBlock, } from "../models/time-block.model";
import { organizationTable } from '../drizzle-schemas/organizations.db';
import {
    ALIAS_COLUMN_END_AT_UTC,
    ALIAS_COLUMN_START_AT_UTC,
    COLUMN_REASON, SORT_BY_END_AT_UTC, SORT_BY_REQUESTED_AT_UTC, SORT_BY_RESPONDED_AT_UTC, SORT_BY_START_AT_UTC } from '../databases/contracts/time-block.contract';
import { mapDatabaseError } from '../utils/map/map-database-error';

const requestUsersTable = alias(usersTable, ALIAS);
const respondUsersTable = alias(usersTable, SECONDARY_ALIAS);

export async function findAll(query: QueryTimeBlock): Promise<TimeBlockResponse[]> {
    const { search, filter, sortBy, order, limit, offset } = query;
    const conditions = [eq(organizationTable.uuid, query.filter?.organizationUuid as string)];
    const sortColumnsDefinition = {
        [SORT_BY_START_AT_UTC]: timeBlockTable.startAtUTC,
        [SORT_BY_END_AT_UTC]: timeBlockTable.endAtUTC,
        [SORT_BY_REQUESTED_AT_UTC]: timeBlockTable.requestedAtUTC,
        [SORT_BY_RESPONDED_AT_UTC]: timeBlockTable.respondedAtUTC,
    };
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push(or(ilike(sql`${requestUsersTable.firstName} || ' ' || ${requestUsersTable.lastName}`, searchValue), ilike(sql`${respondUsersTable.firstName} || ' ' || ${respondUsersTable.lastName}`, searchValue))!);
    }
    if (filter?.requestStatus) {
        conditions.push(eq(timeBlockTable.requestStatus, filter.requestStatus));
    }
    if (filter?.requestUserUuid) {
        conditions.push(eq(requestUsersTable.uuid, filter.requestUserUuid));
    }
    if (filter?.respondUserUuid) {
        conditions.push(eq(respondUsersTable.uuid, filter.respondUserUuid));
    }
    if (filter?.fromDate !== undefined && filter?.toDate !== undefined) {
        conditions.push(and(lt(timeBlockTable.startAtUTC, filter.toDate), gt(timeBlockTable.endAtUTC, filter.fromDate))!);
    }
    const sortColumn = sortColumnsDefinition[sortBy ?? SORT_BY_REQUESTED_AT_UTC];
    const sortOrder = order?.toUpperCase() === "ASC" ? asc(sortColumn) : desc(sortColumn);
    return await drizzleConnection
        .select({ uuid: timeBlockTable.uuid, reason: timeBlockTable.reason, startAtUTC: timeBlockTable.startAtUTC, endAtUTC: timeBlockTable.endAtUTC, requestedAtUTC: timeBlockTable.requestedAtUTC, respondedAtUTC: timeBlockTable.respondedAtUTC, requestStatus: timeBlockTable.requestStatus, requestUserUuid: requestUsersTable.uuid, requestUserFirstName: requestUsersTable.firstName, requestUserLastName: requestUsersTable.lastName, requestUserProfilePicturePath: requestUsersTable.profilePicturePath, respondUserUuid: respondUsersTable.uuid, respondUserFirstName: respondUsersTable.firstName, respondUserLastName: respondUsersTable.lastName, respondUserProfilePicturePath: respondUsersTable.profilePicturePath })
        .from(timeBlockTable)
        .innerJoin(requestUsersTable, eq(requestUsersTable.id, timeBlockTable.requestUserId))
        .leftJoin(respondUsersTable, eq(respondUsersTable.id, timeBlockTable.respondUserId))
        .where(and(...conditions))
        .orderBy(sortOrder, asc(timeBlockTable.uuid))
        .limit(limit)
        .offset(offset as number);
}

export async function countAll(query: QueryTimeBlock): Promise<number> {
    const { search, filter} = query;
    const conditions = [eq(organizationTable.uuid, query.filter?.organizationUuid as string)];
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push(or(ilike(sql`${requestUsersTable.firstName} || ' ' || ${requestUsersTable.lastName}`, searchValue), ilike(sql`${respondUsersTable.firstName} || ' ' || ${respondUsersTable.lastName}`, searchValue))!);
    }
    if (filter?.requestStatus) {
        conditions.push(eq(timeBlockTable.requestStatus, filter.requestStatus));
    }
    if (filter?.requestUserUuid) {
        conditions.push(eq(requestUsersTable.uuid, filter.requestUserUuid));
    }
    if (filter?.respondUserUuid) {
        conditions.push(eq(respondUsersTable.uuid, filter.respondUserUuid));
    }
    if (filter?.fromDate !== undefined && filter?.toDate !== undefined) {
        conditions.push(and(lt(timeBlockTable.startAtUTC, filter.toDate), gt(timeBlockTable.endAtUTC, filter.fromDate))!);
    }
    const [result] = await drizzleConnection
        .select({ totalNumberOfTimeBlocks: count()})
        .from(timeBlockTable)
        .innerJoin(requestUsersTable, eq(requestUsersTable.id, timeBlockTable.requestUserId))
        .leftJoin(respondUsersTable, eq(respondUsersTable.id, timeBlockTable.respondUserId))
        .where(and(...conditions));
    return result.totalNumberOfTimeBlocks;
}

export async function findByUuid(organizationUuid: string, timeBlockUuid: string): Promise<TimeBlockResponse> {
    const [result] = await drizzleConnection
        .select({ uuid: timeBlockTable.uuid, reason: timeBlockTable.reason, startAtUTC: timeBlockTable.startAtUTC, endAtUTC: timeBlockTable.endAtUTC, requestedAtUTC: timeBlockTable.requestedAtUTC, respondedAtUTC: timeBlockTable.respondedAtUTC, requestStatus: timeBlockTable.requestStatus, requestUserUuid: requestUsersTable.uuid, requestUserFirstName: requestUsersTable.firstName, requestUserLastName: requestUsersTable.lastName, requestUserProfilePicturePath: requestUsersTable.profilePicturePath, respondUserUuid: respondUsersTable.uuid, respondUserFirstName: respondUsersTable.firstName, respondUserLastName: respondUsersTable.lastName, respondUserProfilePicturePath: respondUsersTable.profilePicturePath })
        .from(timeBlockTable)
        .innerJoin(organizationTable,eq(organizationTable.id, timeBlockTable.organizationId))
        .innerJoin(requestUsersTable, eq(requestUsersTable.id, timeBlockTable.requestUserId))
        .leftJoin(respondUsersTable, eq(respondUsersTable.id, timeBlockTable.respondUserId))
        .where(and(eq(timeBlockTable.uuid, timeBlockUuid), eq(organizationTable.uuid, organizationUuid)));
    return result;
}

export async function create(timeBlock: CreateTimeBlock): Promise<TimeBlock> {
    try {
        const [result] = await drizzleConnection
            .insert(timeBlockTable)
            .select(
                drizzleConnection
                .select({ reason: sql<string>`${timeBlock.reason}`.as(COLUMN_REASON), startAtUTC: sql<string>`${timeBlock.startAtUTC}`.as(ALIAS_COLUMN_START_AT_UTC), endAtUTC: sql<string>`${timeBlock.endAtUTC}`.as(ALIAS_COLUMN_END_AT_UTC), requestUserId: usersTable.id, organizationId: organizationTable.id })
                .from(organizationTable)
                .innerJoin(usersTable, and(eq(usersTable.organizationId, organizationTable.id), eq(usersTable.uuid, timeBlock.requestUserUuid)))
                .where(eq(organizationTable.uuid, timeBlock.organizationUuid)))
            .returning({ uuid: timeBlockTable.uuid, reason: timeBlockTable.reason, startAtUTC: timeBlockTable.startAtUTC, endAtUTC: timeBlockTable.endAtUTC, requestedAtUTC: timeBlockTable.requestedAtUTC, respondedAtUTC: timeBlockTable.respondedAtUTC, requestStatus: timeBlockTable.requestStatus });
        return result;
    } catch (error) {
        mapDatabaseError(error);
    }
}


export async function update(timeBlock: UpdateTimeBlock): Promise<TimeBlock> {
    try {
        const respondUserId = drizzleConnection
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(eq(usersTable.uuid, timeBlock.respondUserUuid));
        const organizationId = drizzleConnection
            .select({ id: organizationTable.id })
            .from(organizationTable)
            .where(eq(organizationTable.uuid, timeBlock.organizationUuid));

        const [result] = await drizzleConnection
            .update(timeBlockTable)
            .set({ respondUserId: sql`(${respondUserId})`, respondedAtUTC: new Date().toISOString(), requestStatus: timeBlock.requestStatus, })
            .where(and(eq(timeBlockTable.uuid, timeBlock.uuid), eq(timeBlockTable.organizationId, sql`(${organizationId})`)))
            .returning({ uuid: timeBlockTable.uuid, reason: timeBlockTable.reason, startAtUTC: timeBlockTable.startAtUTC, endAtUTC: timeBlockTable.endAtUTC, requestedAtUTC: timeBlockTable.requestedAtUTC, respondedAtUTC: timeBlockTable.respondedAtUTC, requestStatus: timeBlockTable.requestStatus });
        return result
    } catch (error) {
        mapDatabaseError(error);
    }
}