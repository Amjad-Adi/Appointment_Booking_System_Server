import { z } from "zod";

import { querySchema } from "./query.schema.js";

import {
    SORT_BY_DAY_OF_WEEK,
    SORT_BY_START_TIME,
    SORT_BY_END_TIME,
} from "../../databases/contracts/working-hours.contract.js";

import { DayOfWeek } from "../../models/enums/day-of-week.js";

const timeSchema = z
    .string()
    .regex(
        /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
        "Invalid time",
    );

export const updateWorkingHoursDaySchema = z
    .object({
        dayOfWeek: z.enum(DayOfWeek),

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
                    message:
                        "Start time is required when end time is set",
                });
            }

            if (!endIsSet) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endTime"],
                    message:
                        "End time is required when start time is set",
                });
            }

            return;
        }

        if (
            startTime !== null &&
            endTime !== null &&
            startTime >= endTime
        ) {
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
export const updateWorkingHoursSchema = z
    .object({
        startTime: timeSchema.nullable().optional(),

        endTime: timeSchema.nullable().optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
        const { startTime, endTime } = data;

        if (
            startTime !== undefined &&
            endTime !== undefined
        ) {
            const startIsSet = startTime !== null;
            const endIsSet = endTime !== null;

            if (startIsSet !== endIsSet) {
                if (!startIsSet) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["startTime"],
                        message:
                            "Start time is required when end time is set",
                    });
                }

                if (!endIsSet) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["endTime"],
                        message:
                            "End time is required when start time is set",
                    });
                }

                return;
            }

            if (
                startTime !== null &&
                endTime !== null &&
                startTime >= endTime
            ) {
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
export const updateOrganizationWorkingHoursSchema = z
    .object({
        days: z
            .array(updateWorkingHoursDaySchema)
            .min(
                1,
                "At least one working-hours day is required",
            )
            .max(
                7,
                "A maximum of 7 working-hours days can be updated",
            ),
    })
    .strict()
    .superRefine((data, ctx) => {
        const days = data.days.map(
            (day) => day.dayOfWeek,
        );

        const uniqueDays = new Set(days);

        if (uniqueDays.size !== days.length) {
            ctx.addIssue({
                code: "custom",
                path: ["days"],
                message:
                    "Each day of the week can only be included once",
            });
        }
    });

export const workingHoursFilterSchema = z
    .object({
        organizationUuid: z
            .uuid("Invalid organization UUID")
            .optional(),

        dayOfWeek: z
            .enum(DayOfWeek)
            .optional(),
    })
    .strict();

export const queryWorkingHoursSchema = querySchema
    .extend({
        search: z
            .string()
            .trim()
            .nonempty()
            .max(256)
            .optional(),

        filter: workingHoursFilterSchema.optional(),

        sortBy: z
            .enum([
                SORT_BY_DAY_OF_WEEK,
                SORT_BY_START_TIME,
                SORT_BY_END_TIME,
            ])
            .optional(),
    })
    .strict();