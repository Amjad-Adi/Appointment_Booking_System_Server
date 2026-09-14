import type {
    ServiceCategory,
    CreateServiceCategory,
    UpdateServiceCategory,
    QueryServiceCategory,
} from "../models/service-category.model.js";

import { pool } from "../databases/postgre-connection.js";

import {
    TABLE_NAME,
    ALIAS,
    COLUMN_ID,
    COLUMN_UUID,
    COLUMN_NAME,
    COLUMN_DESCRIPTION,
    COLUMN_PICTURE_PATH,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,
    COLUMN_STATUS,
    ALIAS_COLUMN_PICTURE_PATH,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_UPDATED_AT_UTC,
    ALIAS_TOTAL_NUMBER_OF_SERVICE_CATEGORIES,
    SORT_BY_NAME,
} from "../databases/contracts/service-category.contract.js";

export async function findAll(query: QueryServiceCategory): Promise<ServiceCategory[]> {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        name: `${COLUMN_NAME}`,
        createdAtUTC: `${COLUMN_CREATED_AT_UTC}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy ?? SORT_BY_NAME];
    const sortOrder = query.order?.toUpperCase() ?? "ASC";
    const { status } = query.filter ?? {};
    return (await pool.query(
            `SELECT ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_PICTURE_PATH } AS ${ALIAS_COLUMN_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},  ${COLUMN_STATUS}
             FROM ${TABLE_NAME} ${ALIAS}
             WHERE ($1::TEXT IS NULL OR ${COLUMN_NAME} ILIKE $1)
             AND ($2::TEXT IS NULL OR ${COLUMN_STATUS} = $2)
             ORDER BY ${sortColumn} ${sortOrder}, ${COLUMN_UUID}
             LIMIT $3
             OFFSET $4`,
            [search, status, query.limit, query.offset,]
        )).rows;
}

export async function countAll(query: QueryServiceCategory): Promise<number> {
    const search = query.search ? `%${query.search}%` : null;
    const { status } = query.filter ?? {};
return Number((await pool.query(
    `SELECT COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_SERVICE_CATEGORIES}
             FROM ${TABLE_NAME} ${ALIAS}
             WHERE ($1::TEXT IS NULL OR ${COLUMN_NAME} ILIKE $1)
             AND ($2::TEXT IS NULL OR ${COLUMN_STATUS} = $2)`,
                [search, status])).rows[0].totalNumberOfServiceCategories);
}

export async function findByUuid(uuid: string): Promise<ServiceCategory> {
    return (await pool.query(
            `SELECT ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_PICTURE_PATH } AS ${ALIAS_COLUMN_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},  ${COLUMN_STATUS}
             FROM ${TABLE_NAME} ${ALIAS}
             WHERE ${COLUMN_UUID} = $1`,
            [uuid])).rows[0];
}

export async function isNameFound(name: string): Promise<boolean> {
    return (await pool.query(
            `SELECT 1
             FROM ${TABLE_NAME}
             WHERE ${COLUMN_NAME} = $1`,
            [name]
        )).rowCount !== 0;
}

export async function create(category: CreateServiceCategory): Promise<ServiceCategory> {
    return (await pool.query(
            `INSERT INTO ${TABLE_NAME} ( ${COLUMN_NAME}, ${COLUMN_DESCRIPTION}, ${COLUMN_PICTURE_PATH})
             VALUES ($1,$2,$3))
            RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_PICTURE_PATH } AS ${ALIAS_COLUMN_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},  ${COLUMN_STATUS}`,
            [category.name, category.description, category.picturePath,])).rows[0];
}

export async function update(category: UpdateServiceCategory): Promise<ServiceCategory> {
    return (await pool.query(
        `UPDATE ${TABLE_NAME}
             SET
                ${COLUMN_NAME} = COALESCE($1, ${COLUMN_NAME}),
                ${COLUMN_DESCRIPTION} =COALESCE($2, ${COLUMN_DESCRIPTION}),
                ${COLUMN_PICTURE_PATH} =COALESCE($3, ${COLUMN_PICTURE_PATH}),
                ${COLUMN_STATUS} =COALESCE($4, ${COLUMN_STATUS}),
                ${COLUMN_UPDATED_AT_UTC} = now()
             WHERE ${COLUMN_UUID} = $5
             RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_PICTURE_PATH } AS ${ALIAS_COLUMN_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},  ${COLUMN_STATUS}`,
            [category.name, category.description, category.picturePath, category.status, category.uuid,])).rows[0];
}

export async function findCategoryIds(uuidArray: string[]): Promise<number[]> {
    if (uuidArray.length === 0) {
        return [];
    }
    return (
        await pool.query(
                `SELECT ${COLUMN_ID}
                FROM ${TABLE_NAME}
                WHERE ${COLUMN_UUID} = ANY($1::UUID[])`,
            [uuidArray])).rows.map((row) => Number(row[COLUMN_ID]));
}