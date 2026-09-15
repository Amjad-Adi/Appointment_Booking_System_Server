import { z } from "zod";

import { querySchema } from "./query.schema.js";

import {
    SORT_BY_DAY_OF_WEEK,
    SORT_BY_START_TIME,
    SORT_BY_END_TIME,
} from "../../databases/contracts/working-hours.contract.js";

import { DayOfWeek } from "../../models/enums/day-of-week.js";

export const updateWorkingHoursSchema = z.object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid start time").nullable().optional(),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid end time",).nullable().optional(),
}).strict().superRefine((data, ctx) => {
    const { startTime, endTime } = data;
    if (startTime !== undefined && startTime !== null && endTime !== undefined && endTime !== null && startTime >= endTime) {
        ctx.addIssue({code: "custom", path: ["endTime"], message: "End time must be after start time"});
    }
});

export const workingHoursFilterSchema = z.object({
    organizationUuid: z.uuid("Invalid organization UUID").optional(),
    dayOfWeek: z.enum(DayOfWeek).optional(),
}).strict();

export const queryWorkingHoursSchema = querySchema.extend({
    search: z.string().trim().nonempty().max(256).optional(),
    filter: workingHoursFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_DAY_OF_WEEK, SORT_BY_START_TIME, SORT_BY_END_TIME,]).optional()
}).strict();