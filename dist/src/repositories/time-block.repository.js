"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findByUuid = findByUuid;
exports.create = create;
exports.update = update;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_connection_js_1 = require("../databases/drizzle-connection.js");
const time_block_db_js_1 = require("../drizzle-schemas/time-block.db.js");
const users_db_js_1 = require("../drizzle-schemas/users.db.js");
const user_contract_js_1 = require("../databases/contracts/user.contract.js");
const requestUsersTable = (0, pg_core_1.alias)(users_db_js_1.usersTable, user_contract_js_1.ALIAS);
const respondUsersTable = (0, pg_core_1.alias)(users_db_js_1.usersTable, user_contract_js_1.SECONDARY_ALIAS);
function selectTimeBlock(requestUsersTable, respondUsersTable) {
    return {
        uuid: time_block_db_js_1.timeBlockTable.uuid,
        reason: time_block_db_js_1.timeBlockTable.reason,
        startAtUTC: time_block_db_js_1.timeBlockTable.startAtUTC,
        endAtUTC: time_block_db_js_1.timeBlockTable.endAtUTC,
        requestedAtUTC: time_block_db_js_1.timeBlockTable.requestedAtUTC,
        respondedAtUTC: time_block_db_js_1.timeBlockTable.respondedAtUTC,
        requestStatus: time_block_db_js_1.timeBlockTable.requestStatus,
        requestUserUuid: requestUsersTable.uuid,
        requestUserFirstName: requestUsersTable.firstName,
        requestUserLastName: requestUsersTable.lastName,
        requestUserProfilePicturePath: requestUsersTable.profilePicturePath,
        respondUserUuid: respondUsersTable.uuid,
        respondUserFirstName: respondUsersTable.firstName,
        respondUserLastName: respondUsersTable.lastName,
        respondUserProfilePicturePath: respondUsersTable.profilePicturePath,
    };
}
function buildDateRangeConditions(query) {
    if (query.filter?.fromDate === undefined ||
        query.filter?.toDate === undefined) {
        return undefined;
    }
    /*
     * Interval overlap:
     *
     * block.start < requestedEnd
     * AND
     * block.end > requestedStart
     *
     * This also finds blocks that cross midnight.
     */
    return (0, drizzle_orm_1.and)((0, drizzle_orm_1.lt)(time_block_db_js_1.timeBlockTable.startAtUTC, query.filter.toDate), (0, drizzle_orm_1.gt)(time_block_db_js_1.timeBlockTable.endAtUTC, query.filter.fromDate));
}
function buildConditions(query) {
    const conditions = [
        (0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable.organizationId, query.organizationId),
    ];
    const { search, filter, } = query;
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(time_block_db_js_1.timeBlockTable.reason, searchValue), (0, drizzle_orm_1.ilike)(requestUsersTable.firstName, searchValue), (0, drizzle_orm_1.ilike)(requestUsersTable.lastName, searchValue)));
    }
    if (filter?.requestStatus) {
        conditions.push((0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable.requestStatus, filter.requestStatus));
    }
    if (filter?.requestUserUuid) {
        conditions.push((0, drizzle_orm_1.eq)(requestUsersTable.uuid, filter.requestUserUuid));
    }
    if (filter?.respondUserUuid) {
        conditions.push((0, drizzle_orm_1.eq)(respondUsersTable.uuid, filter.respondUserUuid));
    }
    const dateRange = buildDateRangeConditions(query);
    if (dateRange) {
        conditions.push(dateRange);
    }
    return conditions;
}
async function findAll(query) {
    const { sortBy = "requestedAtUTC", order = "desc", limit, offset, } = query;
    const conditions = buildConditions(query);
    const sortColumn = {
        startAtUTC: time_block_db_js_1.timeBlockTable.startAtUTC,
        endAtUTC: time_block_db_js_1.timeBlockTable.endAtUTC,
        requestedAtUTC: time_block_db_js_1.timeBlockTable.requestedAtUTC,
        respondedAtUTC: time_block_db_js_1.timeBlockTable.respondedAtUTC,
        requestStatus: time_block_db_js_1.timeBlockTable.requestStatus,
    }[sortBy];
    const sortOrder = order === "asc"
        ? (0, drizzle_orm_1.asc)(sortColumn)
        : (0, drizzle_orm_1.desc)(sortColumn);
    return await drizzle_connection_js_1.drizzleConnection
        .select(selectTimeBlock(requestUsersTable, respondUsersTable))
        .from(time_block_db_js_1.timeBlockTable)
        .innerJoin(requestUsersTable, (0, drizzle_orm_1.eq)(requestUsersTable.id, time_block_db_js_1.timeBlockTable.requestUserId))
        .leftJoin(respondUsersTable, (0, drizzle_orm_1.eq)(respondUsersTable.id, time_block_db_js_1.timeBlockTable.respondUserId))
        .where((0, drizzle_orm_1.and)(...conditions))
        .orderBy(sortOrder, (0, drizzle_orm_1.asc)(time_block_db_js_1.timeBlockTable.uuid))
        .limit(limit)
        .offset(offset);
}
async function countAll(query) {
    const conditions = buildConditions(query);
    const [result] = await drizzle_connection_js_1.drizzleConnection
        .select({
        count: (0, drizzle_orm_1.count)(),
    })
        .from(time_block_db_js_1.timeBlockTable)
        .innerJoin(requestUsersTable, (0, drizzle_orm_1.eq)(requestUsersTable.id, time_block_db_js_1.timeBlockTable.requestUserId))
        .leftJoin(respondUsersTable, (0, drizzle_orm_1.eq)(respondUsersTable.id, time_block_db_js_1.timeBlockTable.respondUserId))
        .where((0, drizzle_orm_1.and)(...conditions));
    return result?.count ?? 0;
}
async function findByUuid(organizationId, timeBlockUuid) {
    return (await drizzle_connection_js_1.drizzleConnection
        .select(selectTimeBlock(requestUsersTable, respondUsersTable))
        .from(time_block_db_js_1.timeBlockTable)
        .innerJoin(requestUsersTable, (0, drizzle_orm_1.eq)(requestUsersTable.id, time_block_db_js_1.timeBlockTable.requestUserId))
        .leftJoin(respondUsersTable, (0, drizzle_orm_1.eq)(respondUsersTable.id, time_block_db_js_1.timeBlockTable.respondUserId))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable.uuid, timeBlockUuid), (0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable.organizationId, organizationId))))[0];
}
async function create(timeBlock) {
    return (await drizzle_connection_js_1.drizzleConnection
        .insert(time_block_db_js_1.timeBlockTable)
        .values({
        reason: timeBlock.reason,
        startAtUTC: timeBlock.startAtUTC,
        endAtUTC: timeBlock.endAtUTC,
        requestUserId: timeBlock.requestUserId,
        organizationId: timeBlock.organizationId,
    })
        .returning({
        uuid: time_block_db_js_1.timeBlockTable.uuid,
        reason: time_block_db_js_1.timeBlockTable.reason,
        startAtUTC: time_block_db_js_1.timeBlockTable.startAtUTC,
        endAtUTC: time_block_db_js_1.timeBlockTable.endAtUTC,
        requestedAtUTC: time_block_db_js_1.timeBlockTable.requestedAtUTC,
        respondedAtUTC: time_block_db_js_1.timeBlockTable.respondedAtUTC,
        requestStatus: time_block_db_js_1.timeBlockTable.requestStatus,
    }))[0];
}
async function update(timeBlock, organizationId) {
    return (await drizzle_connection_js_1.drizzleConnection
        .update(time_block_db_js_1.timeBlockTable)
        .set({
        respondUserId: timeBlock.respondUserId,
        respondedAtUTC: new Date().toISOString(),
        requestStatus: timeBlock.requestStatus,
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable.uuid, timeBlock.uuid), (0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable.organizationId, organizationId)))
        .returning({
        uuid: time_block_db_js_1.timeBlockTable.uuid,
        reason: time_block_db_js_1.timeBlockTable.reason,
        startAtUTC: time_block_db_js_1.timeBlockTable.startAtUTC,
        endAtUTC: time_block_db_js_1.timeBlockTable.endAtUTC,
        requestedAtUTC: time_block_db_js_1.timeBlockTable.requestedAtUTC,
        respondedAtUTC: time_block_db_js_1.timeBlockTable.respondedAtUTC,
        requestStatus: time_block_db_js_1.timeBlockTable.requestStatus,
    }))[0];
}
