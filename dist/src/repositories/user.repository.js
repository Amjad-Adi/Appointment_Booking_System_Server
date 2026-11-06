"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findByUid = findByUid;
exports.findByUuid = findByUuid;
exports.findIdByUuid = findIdByUuid;
exports.findUidByUuid = findUidByUuid;
exports.findById = findById;
exports.findByEmail = findByEmail;
exports.create = create;
exports.update = update;
exports.setUserOrganizationId = setUserOrganizationId;
exports.updateByAdmin = updateByAdmin;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const user_contract_js_1 = require("../databases/contracts/user.contract.js");
const organization_contract_js_1 = require("../databases/contracts/organization.contract.js");
const order_1 = require("../models/enums/order");
async function findAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        name: `${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME}||' '||${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME}`,
        createdAtUTC: `${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_CREATED_AT_UTC}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy ?? user_contract_js_1.SORT_BY_NAME];
    const sortOrder = query?.order?.toUpperCase() ?? order_1.Order.ASC;
    const { role, status, organizationUuid, } = query.filter ?? {};
    return (await postgre_connection_js_1.pool.query(`SELECT ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ROLE}, ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_STATUS}
         FROM ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
         LEFT JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
         ON ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ORGANIZATION_ID}= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
         WHERE 
         ($1::TEXT IS NULL OR ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME}||' '||${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} ILIKE $1 OR ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL} ILIKE $1)
         AND ($2::TEXT IS NULL OR ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ROLE}=$2)
         AND ($3::TEXT IS NULL OR ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_STATUS}=$3)
         AND ($4::UUID IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $4)
         ORDER BY ${sortColumn} ${sortOrder},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME}||' '||${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME}
         LIMIT $5
         OFFSET $6`, [search, role, status, organizationUuid, query.limit, query.offset])).rows;
}
async function countAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const { role, status, organizationUuid, } = query.filter ?? {};
    return Number((await postgre_connection_js_1.pool.query(`SELECT COUNT(*) AS ${user_contract_js_1.ALIAS_TOTAL_NUMBER_OF_USERS}
         FROM ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
          LEFT JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
          ON ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ORGANIZATION_ID}= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
         WHERE
             ($1::TEXT IS NULL OR ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME}||' '||${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} ILIKE $1 OR ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL} ILIKE $1)
           AND ($2::TEXT IS NULL OR ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ROLE}=$2)
           AND ($3::TEXT IS NULL OR ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_STATUS}=$3)
           AND ($4::UUID IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $4)`, [search, role, status, organizationUuid])).rows[0].totalNumberOfUsers);
}
async function findByUid(uid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ROLE}, ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_STATUS}
        FROM ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
         LEFT JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
         ON ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ORGANIZATION_ID} = ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
         WHERE ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UID} = $1`, [uid])).rows[0];
}
async function findByUuid(uuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ROLE}, ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_STATUS}
         FROM ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
         LEFT JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
         ON ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ORGANIZATION_ID} = ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
         WHERE ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID} = $1`, [uuid])).rows[0];
}
async function findIdByUuid(uuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${user_contract_js_1.COLUMN_ID}
         FROM ${user_contract_js_1.TABLE_NAME}
         WHERE ${user_contract_js_1.COLUMN_UUID} = $1`, [uuid])).rows[0]?.id;
}
async function findUidByUuid(uuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${user_contract_js_1.COLUMN_UID}
         FROM ${user_contract_js_1.TABLE_NAME}
         WHERE ${user_contract_js_1.COLUMN_UUID} = $1`, [uuid])).rows[0]?.firebase_uid;
}
async function findById(id) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ROLE}, ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_STATUS}
         FROM ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
         LEFT JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
         ON ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ORGANIZATION_ID} = ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
         WHERE ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ID} = $1`, [id])).rows[0];
}
async function findByEmail(email) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ROLE}, ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_STATUS}
             FROM ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
             LEFT JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
             ON ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ORGANIZATION_ID} = ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
             WHERE ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL} = $1`, [email])).rows[0];
}
async function create(user) {
    return (await postgre_connection_js_1.pool.query(`INSERT INTO ${user_contract_js_1.TABLE_NAME}(${user_contract_js_1.COLUMN_FIRST_NAME},${user_contract_js_1.COLUMN_LAST_NAME},${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.COLUMN_UID},${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH},${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.COLUMN_ROLE})
                    VALUES ($1,$2,$3,$4,$5,$6,$7)
                    RETURNING ${user_contract_js_1.COLUMN_UUID},${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${user_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${user_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.COLUMN_ROLE},${user_contract_js_1.COLUMN_STATUS}`, [user.firstName, user.lastName, user.email, user.uid, user.profilePicturePath, user.language, user.role])).rows[0];
}
async function update(user) {
    return (await postgre_connection_js_1.pool.query(`UPDATE ${user_contract_js_1.TABLE_NAME}
         SET ${user_contract_js_1.COLUMN_FIRST_NAME}=COALESCE($1,${user_contract_js_1.COLUMN_FIRST_NAME}),
             ${user_contract_js_1.COLUMN_LAST_NAME}=COALESCE($2,${user_contract_js_1.COLUMN_LAST_NAME}),
             ${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH}=COALESCE($3,${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH}),
             ${user_contract_js_1.COLUMN_LANGUAGE}=COALESCE($4,${user_contract_js_1.COLUMN_LANGUAGE}),
             ${user_contract_js_1.COLUMN_UPDATED_AT_UTC}=now()
         WHERE ${user_contract_js_1.COLUMN_UUID} = $5
         RETURNING ${user_contract_js_1.COLUMN_UUID},${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${user_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${user_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.COLUMN_ROLE},${user_contract_js_1.COLUMN_STATUS}`, [user.firstName, user.lastName, user.profilePicturePath, user.language, user.uuid])).rows[0];
}
async function setUserOrganizationId(organizationId, userUuid, client) {
    const dbPool = (client) ?? postgre_connection_js_1.pool;
    (await dbPool.query(`UPDATE ${user_contract_js_1.TABLE_NAME}
         SET ${user_contract_js_1.COLUMN_ORGANIZATION_ID}=$1
         WHERE ${user_contract_js_1.COLUMN_UUID} = $2`, [organizationId, userUuid]));
}
async function updateByAdmin(user) {
    return (await postgre_connection_js_1.pool.query(`UPDATE ${user_contract_js_1.TABLE_NAME}
         SET ${user_contract_js_1.COLUMN_UPDATED_AT_UTC}=now(),
             ${user_contract_js_1.COLUMN_ROLE}=COALESCE($1,${user_contract_js_1.COLUMN_ROLE}),
             ${user_contract_js_1.COLUMN_STATUS}=COALESCE($2,${user_contract_js_1.COLUMN_STATUS})
         WHERE ${user_contract_js_1.COLUMN_UUID} = $3
        RETURNING ${user_contract_js_1.COLUMN_UUID},${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.COLUMN_EMAIL},${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${user_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${user_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${user_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${user_contract_js_1.COLUMN_LANGUAGE},${user_contract_js_1.COLUMN_ROLE},${user_contract_js_1.COLUMN_STATUS}`, [user.role, user.status, user.uuid])).rows[0];
}
