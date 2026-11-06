"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryServiceSchema = exports.serviceFilterSchema = exports.updateServiceSchema = exports.createServiceSchema = void 0;
const zod_1 = require("zod");
const activation_status_js_1 = require("../../models/enums/activation-status.js");
const query_schema_js_1 = require("./query.schema.js");
const service_contract_js_1 = require("../../databases/contracts/service.contract.js");
exports.createServiceSchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty().max(256),
    description: zod_1.z
        .string()
        .trim()
        .max(4096, 'Description must not exceed 4096 characters')
        .transform((value) => (value === '' ? null : value))
        .nullable()
        .optional(),
    price: zod_1.z.number(),
    durationInMinutes: zod_1.z.number().int().positive(),
    profilePicturePath: zod_1.z.string().trim().nonempty().optional()
}).strict();
exports.updateServiceSchema = exports.createServiceSchema.partial().extend({
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus).optional()
}).strict();
exports.serviceFilterSchema = zod_1.z.object({
    organizationUuid: zod_1.z.uuid().optional(),
    serviceCategoryUuid: zod_1.z.uuid().optional(),
    minPrice: zod_1.z.coerce.number().positive().optional(),
    maxPrice: zod_1.z.coerce.number().positive().optional(),
    maxDurationInMinutes: zod_1.z.coerce.number().positive().optional(),
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus).optional(),
}).strict();
exports.queryServiceSchema = query_schema_js_1.querySchema.extend({
    search: zod_1.z.string().trim().nonempty().max(256).optional(),
    filter: exports.serviceFilterSchema.optional(),
    sortBy: zod_1.z.enum([service_contract_js_1.SORT_BY_NAME, service_contract_js_1.SORT_BY_PRICE, service_contract_js_1.SORT_BY_DURATION_IN_MINUTES, service_contract_js_1.SORT_BY_CREATED_AT_UTC]).optional(),
}).strict();
