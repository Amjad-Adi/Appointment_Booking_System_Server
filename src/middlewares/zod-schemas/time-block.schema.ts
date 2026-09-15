import { z } from "zod";

import { TimeBlockStatus } from "../../models/enums/time-block-status.js";

export const createTimeBlockSchema = z.object({
    reason: z
        .string()
        .trim()
        .nonempty()
        .max(4096),

    startAtUTC: z.iso.datetime({
        offset: true,
    }),

    endAtUTC: z.iso.datetime({
        offset: true,
    }),
})
    .strict()
    .superRefine((data, ctx) => {
        if (data.startAtUTC >= data.endAtUTC) {
            ctx.addIssue({
                code: "custom",
                path: ["endAtUTC"],
                message: "End time must be after start time",
            });
        }
    });

export const updateTimeBlockSchema = z.object({
    requestStatus: z.enum(TimeBlockStatus),
}).strict();

export const timeBlockFilterSchema = z.object({
    organizationUuid: z.uuid().optional(),
    requestStatus: z.enum(TimeBlockStatus).optional(),

    requestUserUuid: z.uuid("Invalid request user UUID").optional(),

    respondUserUuid: z.uuid("Invalid response user UUID").optional(),

    fromDate: z.iso.date().optional(),

    toDate: z.iso.date().optional(),
})
    .strict()
    .superRefine((data, ctx) => {
        if (
            data.fromDate !== undefined &&
            data.toDate !== undefined &&
            data.fromDate > data.toDate
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["toDate"],
                message: "To date must be after or equal to from date",
            });
        }
    });

export const queryTimeBlockSchema = z.object({
    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce.number().int().positive().max(100).default(20),

    search: z.string().trim().max(256).optional(),

    filter: timeBlockFilterSchema.optional(),

    sortBy: z.enum([
        "startAtUTC",
        "endAtUTC",
        "requestedAtUTC",
        "respondedAtUTC",
        "requestStatus",
    ]).default("requestedAtUTC"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).strict();