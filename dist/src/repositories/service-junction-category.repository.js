"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.update = update;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const service_junction_category_contract_js_1 = require("../databases/contracts/service-junction-category.contract.js");
async function create(serviceId, categoryIds) {
    await postgre_connection_js_1.pool.query(`
            INSERT INTO ${service_junction_category_contract_js_1.TABLE_NAME} (${service_junction_category_contract_js_1.COLUMN_SERVICE_ID}, ${service_junction_category_contract_js_1.COLUMN_SERVICE_CATEGORY_ID})
            SELECT $1,category.id
            FROM UNNEST($2::BIGINT[]) AS category(id)`, [serviceId, categoryIds]);
}
async function update(serviceId, categoryIds) {
    const client = await postgre_connection_js_1.pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(`DELETE FROM ${service_junction_category_contract_js_1.TABLE_NAME}
                WHERE ${service_junction_category_contract_js_1.COLUMN_SERVICE_ID} = $1`, [serviceId]);
        await client.query(`INSERT INTO ${service_junction_category_contract_js_1.TABLE_NAME} (
                 ${service_junction_category_contract_js_1.COLUMN_SERVICE_ID},
                 ${service_junction_category_contract_js_1.COLUMN_SERVICE_CATEGORY_ID}
                 )
                 SELECT $1, category.id
                 FROM UNNEST($2::BIGINT[]) AS category(id)`, [serviceId, categoryIds,]);
        await client.query("COMMIT");
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
