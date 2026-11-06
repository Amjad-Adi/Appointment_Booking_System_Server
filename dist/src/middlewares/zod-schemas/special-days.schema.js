"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySpecialDaySchema = exports.specialDayFilterSchema = exports.updateSpecialDaySchema = exports.createSpecialDaySchema = void 0;
const zod_1 = require("zod");
const activation_status_js_1 = require("../../models/enums/activation-status.js");
const special_days_contract_js_1 = require("../../databases/contracts/special-days.contract.js");
const query_schema_1 = require("./query.schema");
exports.createSpecialDaySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .nonempty()
        .max(256),
    dayDate: zod_1.z.iso.date(),
    description: zod_1.z
        .string()
        .trim()
        .nonempty()
        .max(4096)
        .optional(),
}).strict();
exports.updateSpecialDaySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .nonempty()
        .max(256)
        .optional(),
    dayDate: zod_1.z
        .iso
        .date()
        .optional(),
    description: zod_1.z
        .string()
        .trim()
        .nonempty()
        .max(4096)
        .optional(),
    status: zod_1.z
        .enum(activation_status_js_1.ActivationStatus)
        .optional(),
}).strict();
exports.specialDayFilterSchema = zod_1.z.object({
    organizationUuid: zod_1.z
        .uuid()
        .optional(),
    status: zod_1.z
        .enum(activation_status_js_1.ActivationStatus)
        .optional(),
    fromDate: zod_1.z
        .iso
        .date()
        .optional(),
    toDate: zod_1.z
        .iso
        .date()
        .optional(),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.fromDate !== undefined &&
        data.toDate !== undefined &&
        data.fromDate > data.toDate) {
        ctx.addIssue({
            code: "custom",
            path: ["toDate"],
            message: "To date must be after or equal to from date",
        });
    }
});
exports.querySpecialDaySchema = query_schema_1.querySchema
    .extend({
    search: zod_1.z
        .string()
        .trim()
        .max(256)
        .optional(),
    filter: exports.specialDayFilterSchema.optional(),
    sortBy: zod_1.z.enum([
        special_days_contract_js_1.SORT_BY_NAME,
        special_days_contract_js_1.SORT_BY_DAY_DATE,
        special_days_contract_js_1.SORT_BY_CREATED_AT_UTC,
    ], {
        error: "Invalid sort field",
    }).optional(),
}).strict();
