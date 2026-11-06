"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findByUuid = findByUuid;
exports.isNameFound = isNameFound;
exports.create = create;
exports.update = update;
exports.findIdByUuid = findIdByUuid;
exports.findIdByUserUuid = findIdByUserUuid;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const room_contract_js_1 = require("../databases/contracts/room.contract.js");
const organization_contract_js_1 = require("../databases/contracts/organization.contract.js");
const user_contract_js_1 = require("../databases/contracts/user.contract.js");
async function findAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        name: `${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_NAME}`,
        createdAtUTC: `${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_CREATED_AT_UTC}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy] ?? sortColumnsDefinition.name;
    const sortOrder = query.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    return (await postgre_connection_js_1.pool.query(`SELECT ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_UUID},  ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_NAME},  ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_DESCRIPTION},  ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME} AS ${organization_contract_js_1.ALIAS_COLUMN_NAME}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID} AS ${user_contract_js_1.ALIAS_COLUMN_USER_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${room_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${room_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_STATUS},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_OCCUPANCY_STATUS}  AS ${room_contract_js_1.ALIAS_COLUMN_OCCUPANCY_STATUS}
             FROM ${room_contract_js_1.TABLE_NAME} ${room_contract_js_1.ALIAS}
             INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
              ON ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_ORGANIZATION_ID} = ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
              LEFT JOIN ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS} ON ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_USER_ID}= ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ID}
             WHERE ($1::UUID IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1)
             AND ($2::TEXT IS NULL OR ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_NAME} ILIKE $2)
             AND ($3::TEXT IS NULL OR ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_STATUS} ILIKE $3)
             AND ($4::TEXT IS NULL OR ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_OCCUPANCY_STATUS} ILIKE $4)
             ORDER BY ${sortColumn} ${sortOrder},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_UUID}
             LIMIT $5
             OFFSET $6`, [query.filter?.organizationUuid, search, query.filter?.status, query.filter?.occupancyStatus, query.limit, query.offset,])).rows;
}
async function countAll(query) {
    const search = query.search ? `%${query.search}%` : null;
    return Number((await postgre_connection_js_1.pool.query(`SELECT COUNT(*) AS ${room_contract_js_1.ALIAS_TOTAL_NUMBER_OF_ROOMS}
                 FROM ${room_contract_js_1.TABLE_NAME} ${room_contract_js_1.ALIAS}
                 INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
                 ON ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_ORGANIZATION_ID} = ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
                 WHERE ($1::UUID IS NULL OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1)
                 AND ($2::TEXT IS NULL OR ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_NAME} ILIKE $2)
                 AND ($3::TEXT IS NULL OR ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_STATUS} ILIKE $3)
                 AND ($4::TEXT IS NULL OR ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_OCCUPANCY_STATUS} ILIKE $4)`, [query.filter?.organizationUuid, search, query.filter?.status, query.filter?.occupancyStatus,])).rows[0].totalNumberOfRooms);
}
async function findByUuid(roomUuid, organizationUuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_UUID},  ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_NAME},  ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_DESCRIPTION},  ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME} AS ${organization_contract_js_1.ALIAS_COLUMN_NAME}, ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID} AS ${user_contract_js_1.ALIAS_COLUMN_USER_UUID},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_FIRST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME} AS ${user_contract_js_1.ALIAS_COLUMN_LAST_NAME},${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH} AS ${user_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${room_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${room_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_STATUS},${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_OCCUPANCY_STATUS}  AS ${room_contract_js_1.ALIAS_COLUMN_OCCUPANCY_STATUS}
             FROM ${room_contract_js_1.TABLE_NAME} ${room_contract_js_1.ALIAS}
             INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
             ON ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_ORGANIZATION_ID}= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
             LEFT JOIN ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
             ON ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_USER_ID}= ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ID}
             WHERE ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_UUID} = $1
             AND ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $2`, [roomUuid, organizationUuid])).rows[0];
}
async function isNameFound(organizationUuid, name) {
    return (await postgre_connection_js_1.pool.query(`SELECT 1
         FROM ${room_contract_js_1.TABLE_NAME} ${room_contract_js_1.ALIAS}
         INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
         ON ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_ORGANIZATION_ID} = ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
         WHERE
         ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1
         AND ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_NAME} = $2`, [organizationUuid, name])).rowCount != 0;
}
async function create(room) {
    return (await postgre_connection_js_1.pool.query(`INSERT INTO ${room_contract_js_1.TABLE_NAME}(${room_contract_js_1.COLUMN_NAME}, ${room_contract_js_1.COLUMN_DESCRIPTION}, ${room_contract_js_1.COLUMN_ORGANIZATION_ID})
                VALUES ($1, $2, $3)
                    RETURNING ${room_contract_js_1.COLUMN_UUID},${room_contract_js_1.COLUMN_NAME},${room_contract_js_1.COLUMN_DESCRIPTION},${room_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${room_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${room_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${room_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${room_contract_js_1.COLUMN_STATUS}, ${room_contract_js_1.COLUMN_OCCUPANCY_STATUS} AS ${room_contract_js_1.ALIAS_COLUMN_OCCUPANCY_STATUS}`, [room.name, room.description, room.organizationId,])).rows[0];
}
async function update(room) {
    console.log(room);
    return (await postgre_connection_js_1.pool.query(`UPDATE ${room_contract_js_1.TABLE_NAME}
             SET
                 ${room_contract_js_1.COLUMN_NAME}=COALESCE($1,${room_contract_js_1.COLUMN_NAME}),
                 ${room_contract_js_1.COLUMN_DESCRIPTION}=COALESCE($2,${room_contract_js_1.COLUMN_DESCRIPTION}),
                 ${room_contract_js_1.COLUMN_STATUS}=COALESCE($3,${room_contract_js_1.COLUMN_STATUS}),
                 ${room_contract_js_1.COLUMN_OCCUPANCY_STATUS}=COALESCE($4,${room_contract_js_1.COLUMN_OCCUPANCY_STATUS}),
                 ${room_contract_js_1.COLUMN_USER_ID}=$5,
                 ${room_contract_js_1.COLUMN_UPDATED_AT_UTC}=now()
             WHERE ${room_contract_js_1.COLUMN_UUID} = $6
               AND ${room_contract_js_1.COLUMN_ORGANIZATION_ID} = (
                 SELECT ${organization_contract_js_1.COLUMN_ID}
                 FROM ${organization_contract_js_1.TABLE_NAME}
                 WHERE ${organization_contract_js_1.COLUMN_UUID} = $7
             )                    
             RETURNING ${room_contract_js_1.COLUMN_UUID},${room_contract_js_1.COLUMN_NAME},${room_contract_js_1.COLUMN_DESCRIPTION},${room_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${room_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${room_contract_js_1.COLUMN_UPDATED_AT_UTC} AS ${room_contract_js_1.ALIAS_COLUMN_UPDATED_AT_UTC},${room_contract_js_1.COLUMN_STATUS}, ${room_contract_js_1.COLUMN_OCCUPANCY_STATUS} AS ${room_contract_js_1.ALIAS_COLUMN_OCCUPANCY_STATUS}`, [room.name, room.description, room.status, room.occupancyStatus, room.assignedUserId, room.uuid, room.organizationUuid,])).rows[0];
}
async function findIdByUuid(roomUuid, organizationUuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${room_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
             FROM ${room_contract_js_1.TABLE_NAME} ${room_contract_js_1.ALIAS}
             INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
                ON ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_ORGANIZATION_ID} =
                   ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}
             WHERE
                ${room_contract_js_1.ALIAS}.${room_contract_js_1.COLUMN_UUID} = $1
                AND ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $2`, [roomUuid, organizationUuid])).rows[0]?.[organization_contract_js_1.COLUMN_ID];
}
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_connection_js_1 = require("../databases/drizzle-connection.js");
const room_db_js_1 = require("../drizzle-schemas/room.db.js");
const organizations_db_js_1 = require("../drizzle-schemas/organizations.db.js");
const users_db_1 = require("../drizzle-schemas/users.db");
async function findIdByUserUuid(userUuid, organizationUuid) {
    const [result] = await drizzle_connection_js_1.drizzleConnection
        .select({
        roomId: room_db_js_1.roomTable.id,
    })
        .from(room_db_js_1.roomTable)
        .innerJoin(users_db_1.usersTable, (0, drizzle_orm_1.eq)(room_db_js_1.roomTable.userId, users_db_1.usersTable.id))
        .innerJoin(organizations_db_js_1.organizationTable, (0, drizzle_orm_1.eq)(room_db_js_1.roomTable.organizationId, organizations_db_js_1.organizationTable.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(users_db_1.usersTable.uuid, userUuid), (0, drizzle_orm_1.eq)(organizations_db_js_1.organizationTable.uuid, organizationUuid)));
    return result?.roomId;
}
