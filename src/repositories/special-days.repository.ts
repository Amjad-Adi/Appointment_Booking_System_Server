import {
    and,
    asc,
    count,
    desc,
    eq,
    gte,
    ilike,
    lte,
    or,
} from "drizzle-orm";

import { drizzleConnection } from "../databases/drizzle-connection.js";
import { specialDaysTable } from "../drizzle-schemas/special-days.db.js";

import type {
    CreateSpecialDay,
    QuerySpecialDay,
    SpecialDay,
    UpdateSpecialDay,
} from "../models/special-days.model.js";

import {
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_DAY_DATE,
    SORT_BY_NAME,
} from "../databases/contracts/special-days.contract.js";

function selectSpecialDay() {
    return {
        uuid: specialDaysTable.uuid,
        name: specialDaysTable.name,
        dayDate: specialDaysTable.dayDate,
        description: specialDaysTable.description,
        createdAtUTC: specialDaysTable.createdAtUTC,
        updatedAtUTC: specialDaysTable.updatedAtUTC,
        status: specialDaysTable.status,
    };
}

function mapSpecialDay(
    specialDay: ReturnType<typeof selectSpecialDay> extends never
        ? never
        : {
            uuid: string;
            name: string;
            dayDate: string;
            description: string | null;
            createdAtUTC: Date;
            updatedAtUTC: Date;
            status: SpecialDay["status"];
        },
): SpecialDay {
    return {
        uuid: specialDay.uuid,
        name: specialDay.name,
        dayDate: specialDay.dayDate,
        description: specialDay.description,
        createdAtUTC: specialDay.createdAtUTC.toISOString(),
        updatedAtUTC: specialDay.updatedAtUTC.toISOString(),
        status: specialDay.status,
    };
}

function getSortColumn(
    sortBy: QuerySpecialDay["sortBy"],
) {
    switch (sortBy) {
        case SORT_BY_NAME:
            return specialDaysTable.name;

        case SORT_BY_CREATED_AT_UTC:
            return specialDaysTable.createdAtUTC;

        case SORT_BY_DAY_DATE:
        default:
            return specialDaysTable.dayDate;
    }
}

export async function findAll(
    query: QuerySpecialDay,
): Promise<SpecialDay[]> {
    const {
        search,
        filter,
        sortBy = SORT_BY_DAY_DATE,
        sortOrder = "asc",
        limit,
        offset,
    } = query;

    const conditions = [
        eq(
            specialDaysTable.organizationId,
            query.organizationId,
        ),
    ];

    if (search) {
        const searchValue = `%${search}%`;

        conditions.push(
            or(
                ilike(
                    specialDaysTable.name,
                    searchValue,
                ),
                ilike(
                    specialDaysTable.description,
                    searchValue,
                ),
            )!,
        );
    }

    if (filter?.status) {
        conditions.push(
            eq(
                specialDaysTable.status,
                filter.status,
            ),
        );
    }

    if (filter?.fromDate) {
        conditions.push(
            gte(
                specialDaysTable.dayDate,
                filter.fromDate,
            ),
        );
    }

    if (filter?.toDate) {
        conditions.push(
            lte(
                specialDaysTable.dayDate,
                filter.toDate,
            ),
        );
    }

    const sortColumn = getSortColumn(sortBy);

    const order =
        sortOrder === "asc"
            ? asc(sortColumn)
            : desc(sortColumn);

    const results = await drizzleConnection
        .select(selectSpecialDay())
        .from(specialDaysTable)
        .where(and(...conditions))
        .orderBy(
            order,
            asc(specialDaysTable.uuid),
        )
        .limit(limit)
        .offset(offset);

    return results.map(mapSpecialDay);
}

export async function countAll(
    query: QuerySpecialDay,
): Promise<number> {
    const {
        search,
        filter,
    } = query;

    const conditions = [
        eq(
            specialDaysTable.organizationId,
            query.organizationId,
        ),
    ];

    if (search) {
        const searchValue = `%${search}%`;

        conditions.push(
            or(
                ilike(
                    specialDaysTable.name,
                    searchValue,
                ),
                ilike(
                    specialDaysTable.description,
                    searchValue,
                ),
            )!,
        );
    }

    if (filter?.status) {
        conditions.push(
            eq(
                specialDaysTable.status,
                filter.status,
            ),
        );
    }

    if (filter?.fromDate) {
        conditions.push(
            gte(
                specialDaysTable.dayDate,
                filter.fromDate,
            ),
        );
    }

    if (filter?.toDate) {
        conditions.push(
            lte(
                specialDaysTable.dayDate,
                filter.toDate,
            ),
        );
    }

    const [result] = await drizzleConnection
        .select({
            count: count(),
        })
        .from(specialDaysTable)
        .where(and(...conditions));

    return result?.count ?? 0;
}

export async function findByUuid(
    organizationId: number,
    specialDayUuid: string,
): Promise<SpecialDay | undefined> {
    const [result] = await drizzleConnection
        .select(selectSpecialDay())
        .from(specialDaysTable)
        .where(
            and(
                eq(
                    specialDaysTable.uuid,
                    specialDayUuid,
                ),
                eq(
                    specialDaysTable.organizationId,
                    organizationId,
                ),
            ),
        );

    return result
        ? mapSpecialDay(result)
        : undefined;
}

export async function create(
    specialDay: CreateSpecialDay,
): Promise<SpecialDay> {
    const [result] = await drizzleConnection
        .insert(specialDaysTable)
        .values({
            name: specialDay.name,
            dayDate: specialDay.dayDate,
            description:
                specialDay.description ?? null,
            organizationId:
            specialDay.organizationId,
        })
        .returning(selectSpecialDay());

    return mapSpecialDay(result);
}

export async function update(
    specialDay: UpdateSpecialDay,
    organizationId: number,
): Promise<SpecialDay | undefined> {
    const [result] = await drizzleConnection
        .update(specialDaysTable)
        .set({
            ...(specialDay.name !== undefined && {
                name: specialDay.name,
            }),

            ...(specialDay.dayDate !== undefined && {
                dayDate: specialDay.dayDate,
            }),

            ...(specialDay.description !== undefined && {
                description:
                specialDay.description,
            }),

            ...(specialDay.status !== undefined && {
                status: specialDay.status,
            }),

            updatedAtUTC: new Date(),
        })
        .where(
            and(
                eq(
                    specialDaysTable.uuid,
                    specialDay.uuid,
                ),
                eq(
                    specialDaysTable.organizationId,
                    organizationId,
                ),
            ),
        )
        .returning(selectSpecialDay());

    return result
        ? mapSpecialDay(result)
        : undefined;
}

export async function findByDate(
    organizationId: number,
    date: string,
): Promise<SpecialDay | undefined> {
    const [result] = await drizzleConnection
        .select(selectSpecialDay())
        .from(specialDaysTable)
        .where(
            and(
                eq(
                    specialDaysTable.organizationId,
                    organizationId,
                ),
                eq(
                    specialDaysTable.dayDate,
                    date,
                ),
            ),
        );

    return result
        ? mapSpecialDay(result)
        : undefined;
}