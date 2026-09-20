import { z } from "zod";

import { ActivationStatus } from "../../models/enums/activation-status.js";
import {
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_DAY_DATE,
    SORT_BY_NAME,
} from "../../databases/contracts/special-days.contract.js";
import {querySchema} from "./query.schema";

export const createSpecialDaySchema = z.object({
    name: z
        .string()
        .trim()
        .nonempty()
        .max(256),

    dayDate: z.iso.date(),

    description: z
        .string()
        .trim()
        .nonempty()
        .max(4096)
        .optional(),
}).strict();

export const updateSpecialDaySchema = z.object({
    name: z
        .string()
        .trim()
        .nonempty()
        .max(256)
        .optional(),

    dayDate: z
        .iso
        .date()
        .optional(),

    description: z
        .string()
        .trim()
        .nonempty()
        .max(4096)
        .optional(),

    status: z
        .enum(ActivationStatus)
        .optional(),
}).strict();

export const specialDayFilterSchema = z.object({
    organizationUuid: z
        .uuid()
        .optional(),

    status: z
        .enum(ActivationStatus)
        .optional(),

    fromDate: z
        .iso
        .date()
        .optional(),

    toDate: z
        .iso
        .date()
        .optional(),
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

export const querySpecialDaySchema =querySchema
    .extend({

    search: z
        .string()
        .trim()
        .max(256)
        .optional(),

    filter: specialDayFilterSchema.optional(),

    sortBy: z.enum(
        [
            SORT_BY_NAME,
            SORT_BY_DAY_DATE,
            SORT_BY_CREATED_AT_UTC,
        ],
        {
            error: "Invalid sort field",
        }).optional(),

}).strict();