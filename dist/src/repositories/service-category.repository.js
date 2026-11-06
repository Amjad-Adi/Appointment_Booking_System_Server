"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findByUuid = findByUuid;
exports.isNameFound = isNameFound;
exports.create = create;
exports.update = update;
exports.findCategoryIds = findCategoryIds;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const service_category_contract_js_1 = require("../databases/contracts/service-category.contract.js");
async function findAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        name: `${service_category_contract_js_1.COLUMN_NAME}`,
        createdAtUTC: `${service_category_contract_js_1.COLUMN_CREATED_AT_UTC}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy ?? service_category_contract_js_1.SORT_BY_NAME];
    const sortOrder = query.order?.toUpperCase() ?? "ASC";
    const { status } = query.filter ?? {};
    return (await postgre_connection_js_1.pool.query(`SELECT ${service_category_contract_js_1.COLUMN_UUID},${service_category_contract_js_1.COLUMN_NAME},${service_category_contract_js_1.COLUMN_DESCRIPTION},${service_category_contract_js_1.COLUMN_PICTURE_PATH} AS ${service_category_contract_js_1.ALIAS_COLUMN_PICTURE_PATH},${service_category_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${service_category_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${service_category_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${service_category_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},  ${service_category_contract_js_1.COLUMN_STATUS}
             FROM ${service_category_contract_js_1.TABLE_NAME} ${service_category_contract_js_1.ALIAS}
             WHERE ($1::TEXT IS NULL OR ${service_category_contract_js_1.COLUMN_NAME} ILIKE $1)
             AND ($2::TEXT IS NULL OR ${service_category_contract_js_1.COLUMN_STATUS} = $2)
             ORDER BY ${sortColumn} ${sortOrder}, ${service_category_contract_js_1.COLUMN_UUID}
             LIMIT $3
             OFFSET $4`, [search, status, query.limit, query.offset,])).rows;
}
async function countAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const { status } = query.filter ?? {};
    return Number((await postgre_connection_js_1.pool.query(`SELECT COUNT(*) AS ${service_category_contract_js_1.ALIAS_TOTAL_NUMBER_OF_SERVICE_CATEGORIES}
             FROM ${service_category_contract_js_1.TABLE_NAME} ${service_category_contract_js_1.ALIAS}
             WHERE ($1::TEXT IS NULL OR ${service_category_contract_js_1.COLUMN_NAME} ILIKE $1)
             AND ($2::TEXT IS NULL OR ${service_category_contract_js_1.COLUMN_STATUS} = $2)`, [search, status])).rows[0].totalNumberOfServiceCategories);
}
async function findByUuid(uuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${service_category_contract_js_1.COLUMN_UUID},${service_category_contract_js_1.COLUMN_NAME},${service_category_contract_js_1.COLUMN_DESCRIPTION},${service_category_contract_js_1.COLUMN_PICTURE_PATH} AS ${service_category_contract_js_1.ALIAS_COLUMN_PICTURE_PATH},${service_category_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${service_category_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${service_category_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${service_category_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},  ${service_category_contract_js_1.COLUMN_STATUS}
             FROM ${service_category_contract_js_1.TABLE_NAME} ${service_category_contract_js_1.ALIAS}
             WHERE ${service_category_contract_js_1.COLUMN_UUID} = $1`, [uuid])).rows[0];
}
async function isNameFound(name) {
    return (await postgre_connection_js_1.pool.query(`SELECT 1
             FROM ${service_category_contract_js_1.TABLE_NAME}
             WHERE ${service_category_contract_js_1.COLUMN_NAME} = $1`, [name])).rowCount !== 0;
}
async function create(category) {
    return (await postgre_connection_js_1.pool.query(`INSERT INTO ${service_category_contract_js_1.TABLE_NAME} ( ${service_category_contract_js_1.COLUMN_NAME}, ${service_category_contract_js_1.COLUMN_DESCRIPTION}, ${service_category_contract_js_1.COLUMN_PICTURE_PATH})
             VALUES ($1,$2,$3))
            RETURNING ${service_category_contract_js_1.COLUMN_UUID},${service_category_contract_js_1.COLUMN_NAME},${service_category_contract_js_1.COLUMN_DESCRIPTION},${service_category_contract_js_1.COLUMN_PICTURE_PATH} AS ${service_category_contract_js_1.ALIAS_COLUMN_PICTURE_PATH},${service_category_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${service_category_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${service_category_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${service_category_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},  ${service_category_contract_js_1.COLUMN_STATUS}`, [category.name, category.description, category.picturePath,])).rows[0];
}
async function update(category) {
    return (await postgre_connection_js_1.pool.query(`UPDATE ${service_category_contract_js_1.TABLE_NAME}
             SET
                ${service_category_contract_js_1.COLUMN_NAME} = COALESCE($1, ${service_category_contract_js_1.COLUMN_NAME}),
                ${service_category_contract_js_1.COLUMN_DESCRIPTION} =COALESCE($2, ${service_category_contract_js_1.COLUMN_DESCRIPTION}),
                ${service_category_contract_js_1.COLUMN_PICTURE_PATH} =COALESCE($3, ${service_category_contract_js_1.COLUMN_PICTURE_PATH}),
                ${service_category_contract_js_1.COLUMN_STATUS} =COALESCE($4, ${service_category_contract_js_1.COLUMN_STATUS}),
                ${service_category_contract_js_1.COLUMN_UPDATED_AT_UTC} = now()
             WHERE ${service_category_contract_js_1.COLUMN_UUID} = $5
             RETURNING ${service_category_contract_js_1.COLUMN_UUID},${service_category_contract_js_1.COLUMN_NAME},${service_category_contract_js_1.COLUMN_DESCRIPTION},${service_category_contract_js_1.COLUMN_PICTURE_PATH} AS ${service_category_contract_js_1.ALIAS_COLUMN_PICTURE_PATH},${service_category_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${service_category_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${service_category_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${service_category_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},  ${service_category_contract_js_1.COLUMN_STATUS}`, [category.name, category.description, category.picturePath, category.status, category.uuid,])).rows[0];
}
async function findCategoryIds(uuidArray) {
    if (uuidArray.length === 0) {
        return [];
    }
    return (await postgre_connection_js_1.pool.query(`SELECT ${service_category_contract_js_1.COLUMN_ID}
                FROM ${service_category_contract_js_1.TABLE_NAME}
                WHERE ${service_category_contract_js_1.COLUMN_UUID} = ANY($1::UUID[])`, [uuidArray])).rows.map((row) => Number(row[service_category_contract_js_1.COLUMN_ID]));
}
