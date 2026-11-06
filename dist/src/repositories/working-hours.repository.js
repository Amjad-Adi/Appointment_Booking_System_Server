"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findByUuid = findByUuid;
exports.createWorkingDays = createWorkingDays;
exports.update = update;
exports.updateWeek = updateWeek;
exports.findTodayWorkingHours = findTodayWorkingHours;
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_connection_js_1 = require("../databases/drizzle-connection.js");
const working_hours_db_js_1 = require("../drizzle-schemas/working-hours.db.js");
const organizations_db_js_1 = require("../drizzle-schemas/organizations.db.js");
const workingHoursSelect = {
    uuid: working_hours_db_js_1.workingHoursTable.uuid,
    dayOfWeek: working_hours_db_js_1.workingHoursTable.dayOfWeek,
    startTime: working_hours_db_js_1.workingHoursTable.startTime,
    endTime: working_hours_db_js_1.workingHoursTable.endTime,
};
const workingHoursResponseSelect = {
    ...workingHoursSelect,
    organizationUuid: organizations_db_js_1.organizationTable.uuid,
    organizationName: organizations_db_js_1.organizationTable.name,
};
async function findAll(query) {
    const conditions = [];
    if (query.filter?.organizationUuid) {
        conditions.push((0, drizzle_orm_1.eq)(organizations_db_js_1.organizationTable.uuid, query.filter.organizationUuid));
    }
    if (query.filter?.dayOfWeek) {
        conditions.push((0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.dayOfWeek, query.filter.dayOfWeek));
    }
    if (query.search) {
        conditions.push((0, drizzle_orm_1.ilike)(working_hours_db_js_1.workingHoursTable.dayOfWeek, `%${query.search}%`));
    }
    let orderBy;
    switch (query.sortBy) {
        case "startTime":
            orderBy = query.order?.toUpperCase() === "DESC" ? (0, drizzle_orm_1.desc)(working_hours_db_js_1.workingHoursTable.startTime) : (0, drizzle_orm_1.asc)(working_hours_db_js_1.workingHoursTable.startTime);
            break;
        case "endTime":
            orderBy = query.order?.toUpperCase() === "DESC" ? (0, drizzle_orm_1.desc)(working_hours_db_js_1.workingHoursTable.endTime) : (0, drizzle_orm_1.asc)(working_hours_db_js_1.workingHoursTable.endTime);
            break;
        case "dayOfWeek":
        default:
            orderBy = query.order?.toUpperCase() === "DESC" ? (0, drizzle_orm_1.desc)(working_hours_db_js_1.workingHoursTable.dayOfWeek) : (0, drizzle_orm_1.asc)(working_hours_db_js_1.workingHoursTable.dayOfWeek);
            break;
    }
    return drizzle_connection_js_1.drizzleConnection
        .select(workingHoursResponseSelect)
        .from(working_hours_db_js_1.workingHoursTable)
        .innerJoin(organizations_db_js_1.organizationTable, (0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.organizationId, organizations_db_js_1.organizationTable.id))
        .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
        .orderBy(orderBy, (0, drizzle_orm_1.asc)(working_hours_db_js_1.workingHoursTable.uuid))
        .limit(query.limit)
        .offset(query.offset);
}
async function countAll(query) {
    const conditions = [];
    if (query.filter?.organizationUuid) {
        conditions.push((0, drizzle_orm_1.eq)(organizations_db_js_1.organizationTable.uuid, query.filter.organizationUuid));
    }
    if (query.filter?.dayOfWeek) {
        conditions.push((0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.dayOfWeek, query.filter.dayOfWeek));
    }
    if (query.search) {
        conditions.push((0, drizzle_orm_1.ilike)(working_hours_db_js_1.workingHoursTable.dayOfWeek, `%${query.search}%`));
    }
    const result = await drizzle_connection_js_1.drizzleConnection
        .select({ count: (0, drizzle_orm_1.sql) `count(*)`, })
        .from(working_hours_db_js_1.workingHoursTable)
        .innerJoin(organizations_db_js_1.organizationTable, (0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.organizationId, organizations_db_js_1.organizationTable.id))
        .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined);
    return Number(result[0]?.count ?? 0);
}
async function findByUuid(organizationUuid, workingHoursUuid) {
    return (await drizzle_connection_js_1.drizzleConnection
        .select(workingHoursResponseSelect)
        .from(working_hours_db_js_1.workingHoursTable)
        .innerJoin(organizations_db_js_1.organizationTable, (0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.organizationId, organizations_db_js_1.organizationTable.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(organizations_db_js_1.organizationTable.uuid, organizationUuid), (0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.uuid, workingHoursUuid))))[0];
}
async function createWorkingDays(workingDays) {
    if (workingDays.length === 0) {
        return [];
    }
    return await drizzle_connection_js_1.drizzleConnection
        .insert(working_hours_db_js_1.workingHoursTable)
        .values(workingDays)
        .onConflictDoNothing({ target: [working_hours_db_js_1.workingHoursTable.organizationId, working_hours_db_js_1.workingHoursTable.dayOfWeek] })
        .returning(workingHoursSelect);
}
async function update(organizationId, workingHours) {
    const updateValues = {};
    if (workingHours.startTime !== undefined) {
        updateValues.startTime = workingHours.startTime;
    }
    if (workingHours.endTime !== undefined) {
        updateValues.endTime = workingHours.endTime;
    }
    if (Object.keys(updateValues).length === 0) {
        return null;
    }
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(working_hours_db_js_1.workingHoursTable)
        .set(updateValues)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.uuid, workingHours.uuid), (0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.organizationId, organizationId)))
        .returning(workingHoursSelect);
    return updated ?? null;
}
async function updateWeek(organizationId, days) {
    return await drizzle_connection_js_1.drizzleConnection.transaction(async (tx) => {
        const updatedDays = [];
        for (const day of days) {
            const [updated] = await tx
                .update(working_hours_db_js_1.workingHoursTable)
                .set({
                startTime: day.startTime,
                endTime: day.endTime,
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.organizationId, organizationId), (0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.dayOfWeek, day.dayOfWeek)))
                .returning(workingHoursSelect);
            if (updated === undefined) {
                throw new Error(`Working hours for ${day.dayOfWeek} were not found`);
            }
            updatedDays.push(updated);
        }
        return updatedDays;
    });
}
async function findTodayWorkingHours(organizationUuid, day) {
    return (await drizzle_connection_js_1.drizzleConnection
        .select(workingHoursSelect)
        .from(working_hours_db_js_1.workingHoursTable)
        .innerJoin(organizations_db_js_1.organizationTable, (0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.organizationId, organizations_db_js_1.organizationTable.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(organizations_db_js_1.organizationTable.uuid, organizationUuid), (0, drizzle_orm_1.eq)(working_hours_db_js_1.workingHoursTable.dayOfWeek, day))))[0];
}
