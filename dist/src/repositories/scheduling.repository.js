"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulingRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_connection_js_1 = require("../databases/drizzle-connection.js");
const appointment_db_js_1 = require("../drizzle-schemas/appointment.db.js");
const time_block_db_js_1 = require("../drizzle-schemas/time-block.db.js");
const time_block_status_js_1 = require("../models/enums/time-block-status.js");
const appointment_model_js_1 = require("../models/appointment.model.js");
function parseDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid UTC date: ${value}`);
    }
    return date;
}
function isValidInterval(startAtUTC, endAtUTC) {
    return (startAtUTC.getTime() <
        endAtUTC.getTime());
}
exports.schedulingRepository = {
    async findBlockingIntervals(organizationId, workerId, roomId, userId, startAtUTC, endAtUTC) {
        const startDate = parseDate(startAtUTC);
        const endDate = parseDate(endAtUTC);
        if (startDate >=
            endDate) {
            return [];
        }
        /*
         * Appointments block the schedule when their intervals
         * overlap the searched interval.
         *
         * Interval rule:
         *
         * appointment.start < search.end
         * AND
         * appointment.end > search.start
         *
         * Therefore:
         *
         * 10:00–10:30
         * 10:30–11:00
         *
         * do NOT conflict.
         */
        const appointments = await drizzle_connection_js_1.drizzleConnection
            .select({
            startAtUTC: appointment_db_js_1.appointmentTable
                .scheduledStartAtUTC,
            endAtUTC: appointment_db_js_1.appointmentTable
                .scheduledEndAtUTC,
        })
            .from(appointment_db_js_1.appointmentTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable
            .organizationId, organizationId), (0, drizzle_orm_1.inArray)(appointment_db_js_1.appointmentTable
            .appointmentStatus, appointment_model_js_1.ACTIVE_APPOINTMENT_STATUSES), (0, drizzle_orm_1.lt)(appointment_db_js_1.appointmentTable
            .scheduledStartAtUTC, endDate), (0, drizzle_orm_1.gt)(appointment_db_js_1.appointmentTable
            .scheduledEndAtUTC, startDate), 
        /*
         * The appointment blocks the schedule
         * when it uses the same:
         *
         * - worker
         * - room
         * - customer
         */
        (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable
            .workerId, workerId), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable
            .roomId, roomId), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable
            .userId, userId))))
            .orderBy(appointment_db_js_1.appointmentTable
            .scheduledStartAtUTC);
        /*
         * timeBlockTable stores its timestamps as strings
         * according to the current Drizzle schema.
         *
         * Do NOT pass Date objects to these comparisons.
         */
        const timeBlocks = await drizzle_connection_js_1.drizzleConnection
            .select({
            startAtUTC: time_block_db_js_1.timeBlockTable
                .startAtUTC,
            endAtUTC: time_block_db_js_1.timeBlockTable
                .endAtUTC,
        })
            .from(time_block_db_js_1.timeBlockTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable
            .organizationId, organizationId), (0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable
            .requestStatus, time_block_status_js_1.TimeBlockStatus.APPROVED), 
        /*
         * This worker's approved time block
         * makes the worker unavailable.
         */
        (0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable
            .requestUserId, workerId), (0, drizzle_orm_1.lt)(time_block_db_js_1.timeBlockTable
            .startAtUTC, endAtUTC), (0, drizzle_orm_1.gt)(time_block_db_js_1.timeBlockTable
            .endAtUTC, startAtUTC)))
            .orderBy(time_block_db_js_1.timeBlockTable
            .startAtUTC);
        const intervals = [];
        for (const appointment of appointments) {
            const start = new Date(appointment.startAtUTC);
            const end = new Date(appointment.endAtUTC);
            if (isValidInterval(start, end)) {
                intervals.push({
                    startAtUTC: start,
                    endAtUTC: end,
                });
            }
        }
        for (const timeBlock of timeBlocks) {
            const start = new Date(timeBlock.startAtUTC);
            const end = new Date(timeBlock.endAtUTC);
            if (isValidInterval(start, end)) {
                intervals.push({
                    startAtUTC: start,
                    endAtUTC: end,
                });
            }
        }
        intervals.sort((a, b) => a.startAtUTC.getTime() -
            b.startAtUTC.getTime());
        return intervals;
    },
    async hasConflict(organizationId, workerId, roomId, userId, startAtUTC, endAtUTC) {
        const startDate = parseDate(startAtUTC);
        const endDate = parseDate(endAtUTC);
        if (startDate >=
            endDate) {
            return true;
        }
        /*
         * Check appointment conflicts.
         */
        const appointments = await drizzle_connection_js_1.drizzleConnection
            .select({
            id: appointment_db_js_1.appointmentTable.id,
        })
            .from(appointment_db_js_1.appointmentTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable
            .organizationId, organizationId), (0, drizzle_orm_1.inArray)(appointment_db_js_1.appointmentTable
            .appointmentStatus, appointment_model_js_1.ACTIVE_APPOINTMENT_STATUSES), (0, drizzle_orm_1.lt)(appointment_db_js_1.appointmentTable
            .scheduledStartAtUTC, endDate), (0, drizzle_orm_1.gt)(appointment_db_js_1.appointmentTable
            .scheduledEndAtUTC, startDate), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable
            .workerId, workerId), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable
            .roomId, roomId), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable
            .userId, userId))))
            .limit(1);
        if (appointments.length > 0) {
            return true;
        }
        /*
         * Check approved worker time blocks.
         *
         * The room assigned to the worker is unavailable while
         * the worker is blocked.
         */
        const timeBlocks = await drizzle_connection_js_1.drizzleConnection
            .select({
            id: time_block_db_js_1.timeBlockTable.id,
        })
            .from(time_block_db_js_1.timeBlockTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable
            .organizationId, organizationId), (0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable
            .requestStatus, time_block_status_js_1.TimeBlockStatus.APPROVED), (0, drizzle_orm_1.eq)(time_block_db_js_1.timeBlockTable
            .requestUserId, workerId), (0, drizzle_orm_1.lt)(time_block_db_js_1.timeBlockTable
            .startAtUTC, endAtUTC), (0, drizzle_orm_1.gt)(time_block_db_js_1.timeBlockTable
            .endAtUTC, startAtUTC)))
            .limit(1);
        return timeBlocks.length > 0;
    },
};
