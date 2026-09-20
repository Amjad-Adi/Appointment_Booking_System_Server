import { pool } from "../databases/postgre-connection.js";

import {
    COLUMN_ID as SERVICE_COLUMN_ID,
    COLUMN_UUID as SERVICE_COLUMN_UUID,
    COLUMN_ORGANIZATION_ID as SERVICE_COLUMN_ORGANIZATION_ID,
    TABLE_NAME as SERVICE_TABLE_NAME,
} from "../databases/contracts/service.contract.js";

import {
    COLUMN_ID as SERVICE_CATEGORY_COLUMN_ID,
    COLUMN_UUID as SERVICE_CATEGORY_COLUMN_UUID,
    TABLE_NAME as SERVICE_CATEGORY_TABLE_NAME,
} from "../databases/contracts/service-category.contract.js";

import {
    COLUMN_SERVICE_ID,
    COLUMN_SERVICE_CATEGORY_ID,
    TABLE_NAME,
} from "../databases/contracts/service-junction-category.contract.js";
export async function create(serviceId: number, categoryIds: number[]): Promise<void> {
    await pool.query(
        `
            INSERT INTO ${TABLE_NAME} (${COLUMN_SERVICE_ID}, ${COLUMN_SERVICE_CATEGORY_ID})
            SELECT $1,category.id
            FROM UNNEST($2::BIGINT[]) AS category(id)`,
        [serviceId, categoryIds]
    );
}

export async function update(serviceId: number, categoryIds: number[]): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
`DELETE FROM ${TABLE_NAME}
                WHERE ${COLUMN_SERVICE_ID} = $1`,
            [serviceId]);

        await client.query(
`INSERT INTO ${TABLE_NAME} (
                 ${COLUMN_SERVICE_ID},
                 ${COLUMN_SERVICE_CATEGORY_ID}
                 )
                 SELECT $1, category.id
                 FROM UNNEST($2::BIGINT[]) AS category(id)`,
                [serviceId, categoryIds,]);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}