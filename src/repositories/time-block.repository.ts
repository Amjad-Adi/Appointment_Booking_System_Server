import { and, asc, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { drizzleConnection } from "../databases/drizzle-connection.js";

import { timeBlockTable } from "../drizzle-schemas/time-block.db.js";
import { organizationTable } from "../drizzle-schemas/organizations.db.js";
import { usersTable } from "../drizzle-schemas/users.db.js";

import {
    ALIAS,
    SECONDARY_ALIAS,
} from "../databases/contracts/user.contract.js";

import type {
    CreateTimeBlock,
    QueryTimeBlock,
    TimeBlock,
    TimeBlockResponse,
    UpdateTimeBlock,
} from "../models/time-block.model";

const requestUsersTable = alias(usersTable, ALIAS);
const respondUsersTable = alias(usersTable, SECONDARY_ALIAS);

function selectTimeBlock(
    requestUsersTable: typeof usersTable | ReturnType<typeof alias>,
    respondUsersTable: typeof usersTable | ReturnType<typeof alias>,
) {
    return {
        uuid: timeBlockTable.uuid,
        reason: timeBlockTable.reason,
        startAtUTC: timeBlockTable.startAtUTC,
        endAtUTC: timeBlockTable.endAtUTC,
        requestedAtUTC: timeBlockTable.requestedAtUTC,
        respondedAtUTC: timeBlockTable.respondedAtUTC,
        requestStatus: timeBlockTable.requestStatus,

        requestUserUuid: requestUsersTable.uuid,
        requestUserFirstName: requestUsersTable.firstName,
        requestUserLastName: requestUsersTable.lastName,
        requestUserProfilePicturePath:
        requestUsersTable.profilePicturePath,

        respondUserUuid: respondUsersTable.uuid,
        respondUserFirstName: respondUsersTable.firstName,
        respondUserLastName: respondUsersTable.lastName,
        respondUserProfilePicturePath:
        respondUsersTable.profilePicturePath,
    };
}

export async function findAll(
    query: QueryTimeBlock,
): Promise<TimeBlockResponse[]> {
    const {
        search,
        filter,
        sortBy = "requestedAtUTC",
        sortOrder = "desc",
        limit,
        offset,
    } = query;

    const conditions = [
        eq(
            timeBlockTable.organizationId,
            query.organizationId,
        ),
    ];

    if (search) {
        const searchValue = `%${search}%`;

        conditions.push(
            or(
                ilike(timeBlockTable.reason, searchValue),
                ilike(
                    requestUsersTable.firstName,
                    searchValue,
                ),
                ilike(
                    requestUsersTable.lastName,
                    searchValue,
                ),
            )!,
        );
    }

    if (filter?.requestStatus) {
        conditions.push(
            eq(
                timeBlockTable.requestStatus,
                filter.requestStatus,
            ),
        );
    }

    if (filter?.requestUserUuid) {
        conditions.push(
            eq(
                requestUsersTable.uuid,
                filter.requestUserUuid,
            ),
        );
    }

    if (filter?.respondUserUuid) {
        conditions.push(
            eq(
                respondUsersTable.uuid,
                filter.respondUserUuid,
            ),
        );
    }

    if (filter?.fromDate) {
        conditions.push(
            gte(
                timeBlockTable.startAtUTC,
                `${filter.fromDate}T00:00:00.000Z`,
            ),
        );
    }

    if (filter?.toDate) {
        conditions.push(
            lte(
                timeBlockTable.startAtUTC,
                `${filter.toDate}T23:59:59.999Z`,
            ),
        );
    }

    const sortColumn = {
        startAtUTC: timeBlockTable.startAtUTC,
        endAtUTC: timeBlockTable.startAtUTC,
        requestedAtUTC: timeBlockTable.requestedAtUTC,
        respondedAtUTC: timeBlockTable.respondedAtUTC,
        requestStatus: timeBlockTable.requestStatus,
    }[sortBy];

    const order = sortOrder === "asc"
        ? asc(sortColumn)
        : desc(sortColumn);

    return await drizzleConnection
        .select(
            selectTimeBlock(
                requestUsersTable,
                respondUsersTable,
            ),
        )
        .from(timeBlockTable)
        .innerJoin(
            requestUsersTable,
            eq(
                requestUsersTable.id,
                timeBlockTable.requestUserId,
            ),
        )
        .leftJoin(
            respondUsersTable,
            eq(
                respondUsersTable.id,
                timeBlockTable.respondUserId,
            ),
        )
        .where(and(...conditions))
        .orderBy(order, asc(timeBlockTable.uuid))
        .limit(limit)
        .offset(offset);
}

export async function countAll(
    query: QueryTimeBlock,
): Promise<number> {
    const {
        search,
        filter,
    } = query;

    const conditions = [
        eq(
            timeBlockTable.organizationId,
            query.organizationId,
        ),
    ];

    if (search) {
        const searchValue = `%${search}%`;

        conditions.push(
            or(
                ilike(timeBlockTable.reason, searchValue),
                ilike(
                    requestUsersTable.firstName,
                    searchValue,
                ),
                ilike(
                    requestUsersTable.lastName,
                    searchValue,
                ),
            )!,
        );
    }

    if (filter?.requestStatus) {
        conditions.push(
            eq(
                timeBlockTable.requestStatus,
                filter.requestStatus,
            ),
        );
    }

    if (filter?.requestUserUuid) {
        conditions.push(
            eq(
                requestUsersTable.uuid,
                filter.requestUserUuid,
            ),
        );
    }

    if (filter?.respondUserUuid) {
        conditions.push(
            eq(
                respondUsersTable.uuid,
                filter.respondUserUuid,
            ),
        );
    }

    if (filter?.fromDate) {
        conditions.push(
            gte(
                timeBlockTable.startAtUTC,
                `${filter.fromDate}T00:00:00.000Z`,
            ),
        );
    }

    if (filter?.toDate) {
        conditions.push(
            lte(
                timeBlockTable.startAtUTC,
                `${filter.toDate}T23:59:59.999Z`,
            ),
        );
    }

    const [result] = await drizzleConnection
        .select({ count: count() })
        .from(timeBlockTable)
        .innerJoin(
            requestUsersTable,
            eq(
                requestUsersTable.id,
                timeBlockTable.requestUserId,
            ),
        )
        .leftJoin(
            respondUsersTable,
            eq(
                respondUsersTable.id,
                timeBlockTable.respondUserId,
            ),
        )
        .where(and(...conditions));

    return result?.count ?? 0;
}

export async function findByUuid(
    organizationId: number,
    timeBlockUuid: string,
): Promise<TimeBlockResponse | undefined> {
    return (
        await drizzleConnection
            .select(
                selectTimeBlock(
                    requestUsersTable,
                    respondUsersTable,
                ),
            )
            .from(timeBlockTable)
            .innerJoin(
                requestUsersTable,
                eq(
                    requestUsersTable.id,
                    timeBlockTable.requestUserId,
                ),
            )
            .leftJoin(
                respondUsersTable,
                eq(
                    respondUsersTable.id,
                    timeBlockTable.respondUserId,
                ),
            )
            .where(
                and(
                    eq(timeBlockTable.uuid, timeBlockUuid),
                    eq(timeBlockTable.organizationId, organizationId),
                ),
            )
    )[0];
}

export async function create(
    timeBlock: CreateTimeBlock,
): Promise<TimeBlock> {
    return (
        await drizzleConnection
            .insert(timeBlockTable)
            .values({
                reason: timeBlock.reason,
                startAtUTC: timeBlock.startAtUTC,
                endAtUTC: timeBlock.endAtUTC,
                requestUserId: timeBlock.requestUserId,
                organizationId: timeBlock.organizationId,
            })
            .returning({
                uuid: timeBlockTable.uuid,
                reason: timeBlockTable.reason,
                startAtUTC: timeBlockTable.startAtUTC,
                endAtUTC: timeBlockTable.endAtUTC,
                requestedAtUTC: timeBlockTable.requestedAtUTC,
                respondedAtUTC: timeBlockTable.respondedAtUTC,
                requestStatus: timeBlockTable.requestStatus,
            })
    )[0];
}

export async function update(
    timeBlock: UpdateTimeBlock,
    organizationId: number,
): Promise<TimeBlock | undefined> {
    return (
        await drizzleConnection
            .update(timeBlockTable)
            .set({
                respondUserId: timeBlock.respondUserId,
                respondedAtUTC: new Date().toISOString(),
                requestStatus: timeBlock.requestStatus,
            })
            .where(
                and(
                    eq(timeBlockTable.uuid, timeBlock.uuid),
                    eq(timeBlockTable.organizationId, organizationId),
                ),
            )
            .returning({
                uuid: timeBlockTable.uuid,
                reason: timeBlockTable.reason,
                startAtUTC: timeBlockTable.startAtUTC,
                endAtUTC: timeBlockTable.endAtUTC,
                requestedAtUTC: timeBlockTable.requestedAtUTC,
                respondedAtUTC: timeBlockTable.respondedAtUTC,
                requestStatus: timeBlockTable.requestStatus,
            })
    )[0];
}