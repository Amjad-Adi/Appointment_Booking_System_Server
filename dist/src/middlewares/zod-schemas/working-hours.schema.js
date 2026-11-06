"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryWorkingHoursSchema = exports.workingHoursFilterSchema = exports.updateOrganizationWorkingHoursSchema = exports.updateWorkingHoursSchema = exports.updateWorkingHoursDaySchema = void 0;
const zod_1 = require("zod");
const query_schema_js_1 = require("./query.schema.js");
const working_hours_contract_js_1 = require("../../databases/contracts/working-hours.contract.js");
const day_of_week_js_1 = require("../../models/enums/day-of-week.js");
const timeSchema = zod_1.z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid time");
exports.updateWorkingHoursDaySchema = zod_1.z
    .object({
    dayOfWeek: zod_1.z.enum(day_of_week_js_1.DayOfWeek),
    startTime: timeSchema.nullable(),
    endTime: timeSchema.nullable(),
})
    .strict()
    .superRefine((data, ctx) => {
    const { startTime, endTime } = data;
    const startIsSet = startTime !== null;
    const endIsSet = endTime !== null;
    if (startIsSet !== endIsSet) {
        if (!startIsSet) {
            ctx.addIssue({
                code: "custom",
                path: ["startTime"],
                message: "Start time is required when end time is set",
            });
        }
        if (!endIsSet) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: "End time is required when start time is set",
            });
        }
        return;
    }
    if (startTime !== null &&
        endTime !== null &&
        startTime >= endTime) {
        ctx.addIssue({
            code: "custom",
            path: ["endTime"],
            message: "End time must be after start time",
        });
    }
});
/**
 * Existing single-day update schema.
 *
 * Used when updating one working-hours row by UUID.
 */
exports.updateWorkingHoursSchema = zod_1.z
    .object({
    startTime: timeSchema.nullable().optional(),
    endTime: timeSchema.nullable().optional(),
})
    .strict()
    .superRefine((data, ctx) => {
    const { startTime, endTime } = data;
    if (startTime !== undefined &&
        endTime !== undefined) {
        const startIsSet = startTime !== null;
        const endIsSet = endTime !== null;
        if (startIsSet !== endIsSet) {
            if (!startIsSet) {
                ctx.addIssue({
                    code: "custom",
                    path: ["startTime"],
                    message: "Start time is required when end time is set",
                });
            }
            if (!endIsSet) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endTime"],
                    message: "End time is required when start time is set",
                });
            }
            return;
        }
        if (startTime !== null &&
            endTime !== null &&
            startTime >= endTime) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: "End time must be after start time",
            });
        }
    }
});
/**
 * Updates one or more days of an organization's working hours.
 */
exports.updateOrganizationWorkingHoursSchema = zod_1.z
    .object({
    days: zod_1.z
        .array(exports.updateWorkingHoursDaySchema)
        .min(1, "At least one working-hours day is required")
        .max(7, "A maximum of 7 working-hours days can be updated"),
})
    .strict()
    .superRefine((data, ctx) => {
    const days = data.days.map((day) => day.dayOfWeek);
    const uniqueDays = new Set(days);
    if (uniqueDays.size !== days.length) {
        ctx.addIssue({
            code: "custom",
            path: ["days"],
            message: "Each day of the week can only be included once",
        });
    }
});
exports.workingHoursFilterSchema = zod_1.z
    .object({
    organizationUuid: zod_1.z
        .uuid("Invalid organization UUID")
        .optional(),
    dayOfWeek: zod_1.z
        .enum(day_of_week_js_1.DayOfWeek)
        .optional(),
})
    .strict();
exports.queryWorkingHoursSchema = query_schema_js_1.querySchema
    .extend({
    search: zod_1.z
        .string()
        .trim()
        .nonempty()
        .max(256)
        .optional(),
    filter: exports.workingHoursFilterSchema.optional(),
    sortBy: zod_1.z
        .enum([
        working_hours_contract_js_1.SORT_BY_DAY_OF_WEEK,
        working_hours_contract_js_1.SORT_BY_START_TIME,
        working_hours_contract_js_1.SORT_BY_END_TIME,
    ])
        .optional(),
})
    .strict();
