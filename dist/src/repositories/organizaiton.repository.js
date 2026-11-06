"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findByUuid = findByUuid;
exports.findIdByUuid = findIdByUuid;
exports.findUserOrganizationByUuid = findUserOrganizationByUuid;
exports.findUserOrganizationByEmail = findUserOrganizationByEmail;
exports.isEmailFound = isEmailFound;
exports.create = create;
exports.update = update;
exports.updateByAdmin = updateByAdmin;
exports.isPhoneNumberFound = isPhoneNumberFound;
exports.drizzleFindIdByUuid = drizzleFindIdByUuid;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const organization_contract_js_1 = require("../databases/contracts/organization.contract.js");
const location_contract_js_1 = require("../databases/contracts/location.contract.js");
const user_contract_js_1 = require("../databases/contracts/user.contract.js");
const location_repository_js_1 = require("./location.repository.js");
const user_repository_js_1 = require("./user.repository.js");
const drizzle_connection_js_1 = require("../databases/drizzle-connection.js");
const organizations_db_js_1 = require("../drizzle-schemas/organizations.db.js");
const drizzle_orm_1 = require("drizzle-orm");
const order_1 = require("../models/enums/order");
async function findAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        name: `${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME}`,
        createdAtUTC: `${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_CREATED_AT_UTC}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy ?? organization_contract_js_1.SORT_BY_NAME];
    const sortOrder = query.order?.toUpperCase() ?? order_1.Order.ASC;
    const { status } = query.filter ?? {};
    return (await postgre_connection_js_1.pool.query(`SELECT ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_EMAIL},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PHONE_NUMBER} AS ${organization_contract_js_1.ALIAS_COLUMN_PHONE_NUMBER},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_BIO},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_NAME} AS ${location_contract_js_1.ALIAS_COLUMN_NAME}, ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_TIMEZONE}, ST_X(${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) AS ${location_contract_js_1.ALIAS_LONGITUDE},ST_Y(${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) AS ${location_contract_js_1.ALIAS_LATITUDE},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${location_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${location_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${organization_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${organization_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_STATUS}
                         FROM ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
                         LEFT JOIN ${location_contract_js_1.TABLE_NAME} ${location_contract_js_1.ALIAS} 
                         ON ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_LOCATION_ID}= ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_ID}
                         WHERE
                             ($1::TEXT IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME} ILIKE $1 OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_EMAIL} ILIKE $1 OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PHONE_NUMBER} ILIKE $1)
                         AND ($2::TEXT IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_STATUS} = $2)
                         ORDER BY ${sortColumn} ${sortOrder}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME}
                         LIMIT $3
                         OFFSET $4`, [search, status, query.limit, query.offset,])).rows;
}
async function countAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const { status } = query.filter ?? {};
    return Number((await postgre_connection_js_1.pool.query(`SELECT COUNT(*) AS ${organization_contract_js_1.ALIAS_TOTAL_NUMBER_OF_ORGANIZATIONS}
         FROM ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
         WHERE
             ($1::TEXT IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME} ILIKE $1 OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_EMAIL} ILIKE $1 OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PHONE_NUMBER} ILIKE $1)
         AND ($2::TEXT IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_STATUS} = $2)`, [search, status])).rows[0].totalNumberOfOrganizations);
}
async function findByUuid(uuid) {
    const result = await postgre_connection_js_1.pool.query(`SELECT
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID},
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME},
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_EMAIL},
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PHONE_NUMBER} AS ${organization_contract_js_1.ALIAS_COLUMN_PHONE_NUMBER},
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_BIO},
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},
            ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_NAME} AS ${location_contract_js_1.ALIAS_COLUMN_NAME},
            ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_TIMEZONE},
            ST_X(${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) AS ${location_contract_js_1.ALIAS_LONGITUDE},
            ST_Y(${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) AS ${location_contract_js_1.ALIAS_LATITUDE},
            ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${location_contract_js_1.COLUMN_CREATED_AT_UTC},
            ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${location_contract_js_1.COLUMN_UPDATED_AT_UTC},
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${organization_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${organization_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},
            ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_STATUS}
        FROM ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
        LEFT JOIN ${location_contract_js_1.TABLE_NAME} ${location_contract_js_1.ALIAS}
            ON ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_LOCATION_ID} =
               ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_ID}
        WHERE ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1`, [uuid]);
    return result.rows[0];
}
async function findIdByUuid(uuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${organization_contract_js_1.COLUMN_ID}
         FROM ${organization_contract_js_1.TABLE_NAME}
         WHERE ${organization_contract_js_1.COLUMN_UUID} = $1`, [uuid])).rows[0]?.id;
}
async function findUserOrganizationByUuid(userUuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_EMAIL},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PHONE_NUMBER} AS ${organization_contract_js_1.ALIAS_COLUMN_PHONE_NUMBER},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_BIO},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_NAME} AS ${location_contract_js_1.ALIAS_COLUMN_NAME},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_TIMEZONE},ST_X(${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) AS ${location_contract_js_1.ALIAS_LONGITUDE} ,ST_Y(${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) AS ${location_contract_js_1.ALIAS_LATITUDE},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${location_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${location_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${organization_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${organization_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_STATUS}
         FROM ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
         INNER JOIN ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS} ON ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}=${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ORGANIZATION_ID}
         LEFT JOIN ${location_contract_js_1.TABLE_NAME} ${location_contract_js_1.ALIAS} ON ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_LOCATION_ID}=${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_ID}
         WHERE ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID} = $1`, [userUuid])).rows[0];
}
async function findUserOrganizationByEmail(userEmail) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_EMAIL},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PHONE_NUMBER} AS ${organization_contract_js_1.ALIAS_COLUMN_PHONE_NUMBER},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_BIO},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_NAME} AS ${location_contract_js_1.ALIAS_COLUMN_NAME},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_TIMEZONE},ST_X(${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) AS ${location_contract_js_1.ALIAS_LONGITUDE} ,ST_Y(${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_LOCATION_ON_MAP}) AS ${location_contract_js_1.ALIAS_LATITUDE},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${location_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${location_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${organization_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${organization_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_STATUS}
         FROM ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
         INNER JOIN ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS} ON ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}=${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ORGANIZATION_ID}
         LEFT JOIN ${location_contract_js_1.TABLE_NAME} ${location_contract_js_1.ALIAS} ON ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_LOCATION_ID}=${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_ID}
         WHERE ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL} = $1`, [userEmail])).rows[0];
}
async function isEmailFound(email) {
    return (await postgre_connection_js_1.pool.query(`SELECT 1
         FROM ${organization_contract_js_1.TABLE_NAME}
         WHERE ${organization_contract_js_1.COLUMN_EMAIL} = $1`, [email])).rowCount != 0;
}
async function create(organization) {
    const client = await postgre_connection_js_1.pool.connect();
    try {
        await client.query("BEGIN");
        const location = organization.location;
        let locationId = null;
        if (!(location == null)) {
            const locationData = await (0, location_repository_js_1.create)(location, client);
            locationId = locationData.id;
        }
        const result = await client.query(`INSERT INTO ${organization_contract_js_1.TABLE_NAME}(${organization_contract_js_1.COLUMN_NAME},${organization_contract_js_1.COLUMN_EMAIL},${organization_contract_js_1.COLUMN_PHONE_NUMBER},${organization_contract_js_1.COLUMN_BIO},${organization_contract_js_1.COLUMN_LOCATION_ID},${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH})
                        VALUES ($1,$2,$3,$4,$5,$6)
                        RETURNING ${organization_contract_js_1.COLUMN_UUID},${organization_contract_js_1.COLUMN_NAME},${organization_contract_js_1.COLUMN_EMAIL},${organization_contract_js_1.COLUMN_PHONE_NUMBER},${organization_contract_js_1.COLUMN_BIO},${organization_contract_js_1.COLUMN_LOCATION_ID},${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH},${organization_contract_js_1.COLUMN_CREATED_AT_UTC},${organization_contract_js_1.COLUMN_UPDATED_AT_UTC},${organization_contract_js_1.COLUMN_STATUS}`, [organization.name, organization.email, organization.phoneNumber, organization.bio, locationId, organization.profilePicturePath]);
        const organizationId = await findIdByUuid(result.rows[0].uuid);
        await (0, user_repository_js_1.setUserOrganizationId)(organizationId, organization.organizationOwnerUuid, client);
        await client.query("COMMIT");
        return result.rows[0];
    }
    catch (e) {
        await client.query("ROLLBACK");
        throw e;
    }
    finally {
        client.release();
    }
}
async function update(organization) {
    const client = await postgre_connection_js_1.pool.connect();
    try {
        await client.query("BEGIN");
        const location = organization.location;
        if (location !== undefined) {
            location.id = (await postgre_connection_js_1.pool.query(`SELECT ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_ID}
                FROM ${location_contract_js_1.TABLE_NAME} ${location_contract_js_1.ALIAS}
                JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS} ON ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_LOCATION_ID} = ${location_contract_js_1.ALIAS}.${location_contract_js_1.COLUMN_ID}
                WHERE ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1`, [organization.uuid])).rows[0].id;
            await (0, location_repository_js_1.updateLocation)(location, client);
        }
        const result = await client.query(`UPDATE ${organization_contract_js_1.TABLE_NAME}
             SET ${organization_contract_js_1.COLUMN_NAME}=COALESCE($1,${organization_contract_js_1.COLUMN_NAME}),
                 ${organization_contract_js_1.COLUMN_BIO}=COALESCE($2,${organization_contract_js_1.COLUMN_BIO}),
                 ${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH}=COALESCE($3,${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH}),
                 ${organization_contract_js_1.COLUMN_UPDATED_AT_UTC}=now(),
                 ${organization_contract_js_1.COLUMN_STATUS}=COALESCE($4,${organization_contract_js_1.COLUMN_STATUS})
             WHERE ${organization_contract_js_1.COLUMN_UUID} = $5
             RETURNING ${organization_contract_js_1.COLUMN_UUID},${organization_contract_js_1.COLUMN_NAME},${organization_contract_js_1.COLUMN_EMAIL},${organization_contract_js_1.COLUMN_PHONE_NUMBER},${organization_contract_js_1.COLUMN_BIO},${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH},${organization_contract_js_1.COLUMN_LOCATION_ID},${organization_contract_js_1.COLUMN_CREATED_AT_UTC},${organization_contract_js_1.COLUMN_UPDATED_AT_UTC},${organization_contract_js_1.COLUMN_STATUS}`, [organization.name, organization.bio, organization.profilePicturePath, organization.status, organization.uuid]);
        await client.query("COMMIT");
        return result.rows[0];
    }
    catch (e) {
        await client.query("ROLLBACK");
        throw e;
    }
    finally {
        client.release();
    }
}
async function updateByAdmin(organization) {
    return (await postgre_connection_js_1.pool.query(`UPDATE ${organization_contract_js_1.TABLE_NAME}
         SET ${organization_contract_js_1.COLUMN_UPDATED_AT_UTC}=now(),
             ${organization_contract_js_1.COLUMN_STATUS}=COALESCE($1,${organization_contract_js_1.COLUMN_STATUS})
         WHERE ${organization_contract_js_1.COLUMN_UUID} = $2
         RETURNING ${organization_contract_js_1.COLUMN_UUID},${organization_contract_js_1.COLUMN_NAME},${organization_contract_js_1.COLUMN_EMAIL},${organization_contract_js_1.COLUMN_PHONE_NUMBER},${organization_contract_js_1.COLUMN_BIO},${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH},${organization_contract_js_1.COLUMN_LOCATION_ID},${organization_contract_js_1.COLUMN_CREATED_AT_UTC},${organization_contract_js_1.COLUMN_UPDATED_AT_UTC},${organization_contract_js_1.COLUMN_STATUS}`, [organization.status, organization.uuid])).rows[0];
}
async function isPhoneNumberFound(phoneNumber) {
    return (await postgre_connection_js_1.pool.query(`SELECT 1
         FROM ${organization_contract_js_1.TABLE_NAME}
         WHERE ${organization_contract_js_1.COLUMN_PHONE_NUMBER} = $1`, [phoneNumber])).rowCount != 0;
}
function drizzleFindIdByUuid(uuid) {
    return drizzle_connection_js_1.drizzleConnection
        .select({ id: organizations_db_js_1.organizationTable.id })
        .from(organizations_db_js_1.organizationTable)
        .where((0, drizzle_orm_1.eq)(organizations_db_js_1.organizationTable.uuid, uuid));
}
