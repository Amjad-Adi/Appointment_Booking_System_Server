"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findByUuid = findByUuid;
exports.isNameFound = isNameFound;
exports.create = create;
exports.update = update;
exports.findIdByUuid = findIdByUuid;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const service_contract_1 = require("../databases/contracts/service.contract");
const service_category_contract_1 = require("../databases/contracts/service-category.contract");
const service_junction_category_contract_1 = require("../databases/contracts/service-junction-category.contract");
const organization_contract_js_1 = require("../databases/contracts/organization.contract.js");
async function findAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        name: `${service_contract_1.ALIAS}.${service_contract_1.COLUMN_NAME}`,
        createdAtUTC: `${service_contract_1.ALIAS}.${service_contract_1.COLUMN_CREATED_AT_UTC}`,
        price: `${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PRICE}`,
        durationInMinutes: `${service_contract_1.ALIAS}.${service_contract_1.COLUMN_DURATION_IN_MINUTES}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy ?? service_contract_1.SORT_BY_NAME];
    const sortOrder = query.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const { organizationUuid, maxPrice, minPrice, status, serviceCategoryUuid, } = query.filter ?? {};
    return (await postgre_connection_js_1.pool.query(`SELECT ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_UUID},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_NAME},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_DESCRIPTION},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PRICE},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_DURATION_IN_MINUTES} AS ${service_contract_1.ALIAS_COLUMN_DURATION_IN_MINUTES},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME} AS ${organization_contract_js_1.ALIAS_COLUMN_NAME}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PICTURE_PATH} AS ${service_contract_1.ALIAS_COLUMN_PICTURE_PATH},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_CREATED_AT_UTC} AS ${service_contract_1.ALIAS_COLUMN_CREATED_AT_UTC}, ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_UPDATED_AT_UTC} AS ${service_contract_1.ALIAS_COLUMN_UPDATED_AT_UTC},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_STATUS},
                    COALESCE((
                             SELECT jsonb_agg(
                                        jsonb_build_object('${service_category_contract_1.COLUMN_UUID}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_UUID},   '${service_category_contract_1.COLUMN_NAME}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_NAME},'${service_category_contract_1.COLUMN_DESCRIPTION}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_DESCRIPTION},'${service_category_contract_1.ALIAS_COLUMN_PICTURE_PATH}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_PICTURE_PATH},'${service_category_contract_1.ALIAS_COLUMN_CREATED_AT_UTC}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_CREATED_AT_UTC},    '${service_category_contract_1.ALIAS_COLUMN_UPDATED_AT_UTC}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_UPDATED_AT_UTC},  '${service_category_contract_1.COLUMN_STATUS}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_STATUS})
                                        ORDER BY ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_NAME}
                            )
                            FROM ${service_junction_category_contract_1.TABLE_NAME} ${service_junction_category_contract_1.ALIAS}
                            INNER JOIN ${service_category_contract_1.TABLE_NAME} ${service_category_contract_1.ALIAS}
                            ON ${service_junction_category_contract_1.ALIAS}.${service_junction_category_contract_1.COLUMN_SERVICE_CATEGORY_ID} =  ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_ID}
                            WHERE ${service_junction_category_contract_1.ALIAS}.${service_junction_category_contract_1.COLUMN_SERVICE_ID} = ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ID}
                            ),
                            '[]'::jsonb
                    )AS ${service_category_contract_1.ALIAS_CATEGORIES}
                    FROM ${service_contract_1.TABLE_NAME} ${service_contract_1.ALIAS}
                    INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
                    ON ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ORGANIZATION_ID}
                    = ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
                    WHERE ($1::UUID IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1)
                      AND ($2::TEXT IS NULL OR ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_NAME} ILIKE $2)
                    AND ($3::NUMERIC IS NULL OR ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PRICE} <= $3)
                    AND ($4::NUMERIC IS NULL OR ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PRICE} >= $4)
                    AND ($5::TEXT IS NULL OR ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_STATUS} = $5)
                    AND ($6::UUID IS NULL OR EXISTS (SELECT 1
                                                    FROM ${service_junction_category_contract_1.TABLE_NAME} ${service_junction_category_contract_1.ALIAS}
                                                    INNER JOIN ${service_category_contract_1.TABLE_NAME} ${service_category_contract_1.ALIAS}
                                                    ON ${service_junction_category_contract_1.ALIAS}.${service_junction_category_contract_1.COLUMN_SERVICE_CATEGORY_ID} =  ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_ID}
                                                    WHERE ${service_junction_category_contract_1.ALIAS}.${service_junction_category_contract_1.COLUMN_SERVICE_ID} = ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ID}
                                                    AND ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_UUID} = $6))
                ORDER BY ${sortColumn} ${sortOrder},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_UUID}
                LIMIT $7
                OFFSET $8`, [organizationUuid, search, maxPrice, minPrice, status, serviceCategoryUuid, query.limit, query.offset,])).rows;
}
async function countAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const { organizationUuid, maxPrice, minPrice, status, serviceCategoryUuid, } = query.filter ?? {};
    return Number((await postgre_connection_js_1.pool.query(`SELECT COUNT(*) AS ${service_contract_1.ALIAS_TOTAL_NUMBER_OF_SERVICES}
                FROM ${service_contract_1.TABLE_NAME} ${service_contract_1.ALIAS}
                INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
                ON ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ORGANIZATION_ID}= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
                WHERE ($1::UUID IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1)
                AND ($2::TEXT IS NULL OR ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_NAME} ILIKE $2)
                AND ($3::NUMERIC IS NULL OR ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PRICE} <= $3)
                AND ($4::NUMERIC IS NULL OR ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PRICE} >= $4)
                AND ($5::TEXT IS NULL OR ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_STATUS} = $5)
                AND ($6::UUID IS NULL OR EXISTS (SELECT 1
                                                    FROM ${service_junction_category_contract_1.TABLE_NAME} ${service_junction_category_contract_1.ALIAS}
                                                    INNER JOIN ${service_category_contract_1.TABLE_NAME} ${service_category_contract_1.ALIAS}
                                                    ON ${service_junction_category_contract_1.ALIAS}.${service_junction_category_contract_1.COLUMN_SERVICE_CATEGORY_ID} =  ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_ID}
                                                    WHERE ${service_junction_category_contract_1.ALIAS}.${service_junction_category_contract_1.COLUMN_SERVICE_ID} = ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ID}
                                                    AND ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_UUID} = $6))`, [organizationUuid, search, maxPrice, minPrice, status, serviceCategoryUuid])).rows[0].totalNumberOfServices);
}
async function findByUuid(serviceUuid, organizationUuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_UUID},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_NAME},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_DESCRIPTION},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PRICE},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_DURATION_IN_MINUTES} AS ${service_contract_1.ALIAS_COLUMN_DURATION_IN_MINUTES},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME} AS ${organization_contract_js_1.ALIAS_COLUMN_NAME}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_PICTURE_PATH} AS ${service_contract_1.ALIAS_COLUMN_PICTURE_PATH},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_CREATED_AT_UTC} AS ${service_contract_1.ALIAS_COLUMN_CREATED_AT_UTC}, ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_UPDATED_AT_UTC} AS ${service_contract_1.ALIAS_COLUMN_UPDATED_AT_UTC},${service_contract_1.ALIAS}.${service_contract_1.COLUMN_STATUS},
                COALESCE((
                        SELECT jsonb_agg(
                            jsonb_build_object('${service_category_contract_1.COLUMN_UUID}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_UUID},   '${service_category_contract_1.COLUMN_NAME}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_NAME},'${service_category_contract_1.COLUMN_DESCRIPTION}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_DESCRIPTION},'${service_category_contract_1.ALIAS_COLUMN_PICTURE_PATH}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_PICTURE_PATH},'${service_category_contract_1.ALIAS_COLUMN_CREATED_AT_UTC}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_CREATED_AT_UTC},    '${service_category_contract_1.ALIAS_COLUMN_UPDATED_AT_UTC}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_UPDATED_AT_UTC},  '${service_category_contract_1.COLUMN_STATUS}', ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_STATUS})      
                            ORDER BY ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_NAME}
                        )
                        FROM ${service_junction_category_contract_1.TABLE_NAME} ${service_junction_category_contract_1.ALIAS}
                        INNER JOIN ${service_category_contract_1.TABLE_NAME} ${service_category_contract_1.ALIAS}
                        ON ${service_junction_category_contract_1.ALIAS}.${service_junction_category_contract_1.COLUMN_SERVICE_CATEGORY_ID} =  ${service_category_contract_1.ALIAS}.${service_category_contract_1.COLUMN_ID}
                        WHERE ${service_junction_category_contract_1.ALIAS}.${service_junction_category_contract_1.COLUMN_SERVICE_ID} = ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ID}
                        ),
                        '[]'::jsonb
                )AS ${service_category_contract_1.ALIAS_CATEGORIES}
                FROM ${service_contract_1.TABLE_NAME} ${service_contract_1.ALIAS}
                INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
                ON ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ORGANIZATION_ID}= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
                WHERE ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_UUID} = $1
                AND ($2::UUID IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $2)`, [serviceUuid, organizationUuid])).rows[0];
}
async function isNameFound(organizationUuid, name) {
    return (await postgre_connection_js_1.pool.query(`SELECT 1
         FROM ${service_contract_1.TABLE_NAME} ${service_contract_1.ALIAS}
                  LEFT JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS} ON ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ORGANIZATION_ID}=${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
         WHERE ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1 AND ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_NAME}=$2`, [organizationUuid, name])).rowCount != 0;
}
async function create(service) {
    return (await postgre_connection_js_1.pool.query(`INSERT INTO ${service_contract_1.TABLE_NAME}(${service_contract_1.COLUMN_NAME},${service_contract_1.COLUMN_DESCRIPTION},${service_contract_1.COLUMN_PRICE},${service_contract_1.COLUMN_DURATION_IN_MINUTES} ,${service_contract_1.COLUMN_PICTURE_PATH},${service_contract_1.COLUMN_ORGANIZATION_ID})
         VALUES ($1,$2,$3,$4,$5,$6)
             RETURNING ${service_contract_1.COLUMN_UUID},${service_contract_1.COLUMN_NAME},${service_contract_1.COLUMN_DESCRIPTION},${service_contract_1.COLUMN_PRICE},${service_contract_1.COLUMN_DURATION_IN_MINUTES} AS ${service_contract_1.ALIAS_COLUMN_DURATION_IN_MINUTES},${service_contract_1.COLUMN_PICTURE_PATH} AS ${service_contract_1.ALIAS_COLUMN_PICTURE_PATH},${service_contract_1.COLUMN_CREATED_AT_UTC} AS ${service_contract_1.ALIAS_COLUMN_CREATED_AT_UTC},${service_contract_1.COLUMN_UPDATED_AT_UTC} AS ${service_contract_1.ALIAS_COLUMN_UPDATED_AT_UTC},${service_contract_1.COLUMN_STATUS}`, [service.name, service.description, service.price, service.durationInMinutes, service.profilePicturePath, service.organizationId])).rows[0];
}
async function update(service) {
    return (await postgre_connection_js_1.pool.query(`UPDATE ${service_contract_1.TABLE_NAME}
         SET ${service_contract_1.COLUMN_NAME}=COALESCE($1,${service_contract_1.COLUMN_NAME}),
             ${service_contract_1.COLUMN_DESCRIPTION}=COALESCE($2,${service_contract_1.COLUMN_DESCRIPTION}),
             ${service_contract_1.COLUMN_PRICE}=COALESCE($3,${service_contract_1.COLUMN_PRICE}),
             ${service_contract_1.COLUMN_DURATION_IN_MINUTES}=COALESCE($4,${service_contract_1.COLUMN_DURATION_IN_MINUTES}),
             ${service_contract_1.COLUMN_PICTURE_PATH}=COALESCE($5,${service_contract_1.COLUMN_PICTURE_PATH}),
             ${service_contract_1.COLUMN_STATUS}=COALESCE($6,${service_contract_1.COLUMN_STATUS}),
             ${service_contract_1.COLUMN_UPDATED_AT_UTC}=now()
         WHERE ${service_contract_1.COLUMN_UUID} = $7
           AND ${service_contract_1.COLUMN_ORGANIZATION_ID}=
               (SELECT id
                FROM ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.TABLE_NAME}
                WHERE ${organization_contract_js_1.COLUMN_UUID}=$8)
             RETURNING ${service_contract_1.COLUMN_UUID},${service_contract_1.COLUMN_NAME},${service_contract_1.COLUMN_DESCRIPTION},${service_contract_1.COLUMN_PRICE},${service_contract_1.COLUMN_DURATION_IN_MINUTES} AS ${service_contract_1.ALIAS_COLUMN_DURATION_IN_MINUTES},${service_contract_1.COLUMN_PICTURE_PATH} AS ${service_contract_1.ALIAS_COLUMN_PICTURE_PATH},${service_contract_1.COLUMN_CREATED_AT_UTC} AS ${service_contract_1.ALIAS_COLUMN_CREATED_AT_UTC},${service_contract_1.COLUMN_UPDATED_AT_UTC} AS ${service_contract_1.ALIAS_COLUMN_UPDATED_AT_UTC},${service_contract_1.COLUMN_STATUS}`, [service.name, service.description, service.price, service.durationInMinutes, service.profilePicturePath, service.status, service.uuid, service.organizationUuid])).rows[0];
}
async function findIdByUuid(serviceUuid, organizationUuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ID}
                FROM ${service_contract_1.TABLE_NAME} ${service_contract_1.ALIAS}
                INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
                ON ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_ORGANIZATION_ID}= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
                WHERE
                ${service_contract_1.ALIAS}.${service_contract_1.COLUMN_UUID} = $1
                AND ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $2`, [serviceUuid, organizationUuid,])).rows[0]?.[service_contract_1.COLUMN_ID];
}
