"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findByUuid = findByUuid;
exports.create = create;
exports.update = update;
exports.findByDate = findByDate;
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_connection_js_1 = require("../databases/drizzle-connection.js");
const special_days_db_js_1 = require("../drizzle-schemas/special-days.db.js");
const special_days_contract_js_1 = require("../databases/contracts/special-days.contract.js");
function selectSpecialDay() {
    return {
        uuid: special_days_db_js_1.specialDaysTable.uuid,
        name: special_days_db_js_1.specialDaysTable.name,
        dayDate: special_days_db_js_1.specialDaysTable.dayDate,
        description: special_days_db_js_1.specialDaysTable.description,
        createdAtUTC: special_days_db_js_1.specialDaysTable.createdAtUTC,
        updatedAtUTC: special_days_db_js_1.specialDaysTable.updatedAtUTC,
        status: special_days_db_js_1.specialDaysTable.status,
    };
}
function mapSpecialDay(specialDay) {
    return {
        uuid: specialDay.uuid,
        name: specialDay.name,
        dayDate: specialDay.dayDate,
        description: specialDay.description,
        createdAtUTC: specialDay.createdAtUTC.toISOString(),
        updatedAtUTC: specialDay.updatedAtUTC.toISOString(),
        status: specialDay.status,
    };
}
function getSortColumn(sortBy) {
    switch (sortBy) {
        case special_days_contract_js_1.SORT_BY_NAME:
            return special_days_db_js_1.specialDaysTable.name;
        case special_days_contract_js_1.SORT_BY_CREATED_AT_UTC:
            return special_days_db_js_1.specialDaysTable.createdAtUTC;
        case special_days_contract_js_1.SORT_BY_DAY_DATE:
        default:
            return special_days_db_js_1.specialDaysTable.dayDate;
    }
}
async function findAll(query) {
    const { search, filter, sortBy = special_days_contract_js_1.SORT_BY_DAY_DATE, order = "asc", limit, offset, } = query;
    const conditions = [
        (0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.organizationId, query.organizationId),
    ];
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(special_days_db_js_1.specialDaysTable.name, searchValue), (0, drizzle_orm_1.ilike)(special_days_db_js_1.specialDaysTable.description, searchValue)));
    }
    if (filter?.status) {
        conditions.push((0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.status, filter.status));
    }
    if (filter?.fromDate) {
        conditions.push((0, drizzle_orm_1.gte)(special_days_db_js_1.specialDaysTable.dayDate, filter.fromDate));
    }
    if (filter?.toDate) {
        conditions.push((0, drizzle_orm_1.lte)(special_days_db_js_1.specialDaysTable.dayDate, filter.toDate));
    }
    const sortColumn = getSortColumn(sortBy);
    const sortOrder = order === "asc"
        ? (0, drizzle_orm_1.asc)(sortColumn)
        : (0, drizzle_orm_1.desc)(sortColumn);
    const results = await drizzle_connection_js_1.drizzleConnection
        .select(selectSpecialDay())
        .from(special_days_db_js_1.specialDaysTable)
        .where((0, drizzle_orm_1.and)(...conditions))
        .orderBy(sortOrder, (0, drizzle_orm_1.asc)(special_days_db_js_1.specialDaysTable.uuid))
        .limit(limit)
        .offset(offset);
    return results.map(mapSpecialDay);
}
async function countAll(query) {
    const { search, filter, } = query;
    const conditions = [
        (0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.organizationId, query.organizationId),
    ];
    if (search) {
        const searchValue = `%${search}%`;
        conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(special_days_db_js_1.specialDaysTable.name, searchValue), (0, drizzle_orm_1.ilike)(special_days_db_js_1.specialDaysTable.description, searchValue)));
    }
    if (filter?.status) {
        conditions.push((0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.status, filter.status));
    }
    if (filter?.fromDate) {
        conditions.push((0, drizzle_orm_1.gte)(special_days_db_js_1.specialDaysTable.dayDate, filter.fromDate));
    }
    if (filter?.toDate) {
        conditions.push((0, drizzle_orm_1.lte)(special_days_db_js_1.specialDaysTable.dayDate, filter.toDate));
    }
    const [result] = await drizzle_connection_js_1.drizzleConnection
        .select({
        count: (0, drizzle_orm_1.count)(),
    })
        .from(special_days_db_js_1.specialDaysTable)
        .where((0, drizzle_orm_1.and)(...conditions));
    return result?.count ?? 0;
}
async function findByUuid(organizationId, specialDayUuid) {
    const [result] = await drizzle_connection_js_1.drizzleConnection
        .select(selectSpecialDay())
        .from(special_days_db_js_1.specialDaysTable)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.uuid, specialDayUuid), (0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.organizationId, organizationId)));
    return result
        ? mapSpecialDay(result)
        : undefined;
}
async function create(specialDay) {
    const [result] = await drizzle_connection_js_1.drizzleConnection
        .insert(special_days_db_js_1.specialDaysTable)
        .values({
        name: specialDay.name,
        dayDate: specialDay.dayDate,
        description: specialDay.description ?? null,
        organizationId: specialDay.organizationId,
    })
        .returning(selectSpecialDay());
    return mapSpecialDay(result);
}
async function update(specialDay, organizationId) {
    const [result] = await drizzle_connection_js_1.drizzleConnection
        .update(special_days_db_js_1.specialDaysTable)
        .set({
        ...(specialDay.name !== undefined && {
            name: specialDay.name,
        }),
        ...(specialDay.dayDate !== undefined && {
            dayDate: specialDay.dayDate,
        }),
        ...(specialDay.description !== undefined && {
            description: specialDay.description,
        }),
        ...(specialDay.status !== undefined && {
            status: specialDay.status,
        }),
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.uuid, specialDay.uuid), (0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.organizationId, organizationId)))
        .returning(selectSpecialDay());
    return result
        ? mapSpecialDay(result)
        : undefined;
}
async function findByDate(organizationId, date) {
    const [result] = await drizzle_connection_js_1.drizzleConnection
        .select(selectSpecialDay())
        .from(special_days_db_js_1.specialDaysTable)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.organizationId, organizationId), (0, drizzle_orm_1.eq)(special_days_db_js_1.specialDaysTable.dayDate, date)));
    return result
        ? mapSpecialDay(result)
        : undefined;
}
