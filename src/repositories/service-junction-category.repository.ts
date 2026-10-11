import { pool } from "../databases/postgres-connection";

import {
    COLUMN_SERVICE_ID,
    COLUMN_SERVICE_CATEGORY_ID,
    TABLE_NAME,
} from "../databases/contracts/service-junction-category.contract";
import { mapDatabaseError } from '../utils/map/map-database-error';

export async function create(serviceId: number, categoryIds: number[]): Promise<void> {
    try{
        await pool.query(
            `
                INSERT INTO ${TABLE_NAME} (${COLUMN_SERVICE_ID}, ${COLUMN_SERVICE_CATEGORY_ID})
                SELECT $1, category.id
                FROM UNNEST($2::BIGINT[]) AS category(id)`,
            [serviceId, categoryIds]
        );
    }catch(error){
        mapDatabaseError(error);
    }
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
            `INSERT INTO ${TABLE_NAME} (${COLUMN_SERVICE_ID}, ${COLUMN_SERVICE_CATEGORY_ID})
             SELECT $1, category.id
             FROM UNNEST($2::BIGINT[]) AS category(id)`,
            [serviceId, categoryIds]);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        mapDatabaseError(error);
    } finally {
        client.release();
    }
}