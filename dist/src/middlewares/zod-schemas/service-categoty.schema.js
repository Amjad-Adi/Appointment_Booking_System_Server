"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryServiceCategorySchema = exports.serviceCategoryFilterSchema = exports.updateServiceCategorySchema = exports.createServiceCategorySchema = void 0;
const zod_1 = require("zod");
const activation_status_js_1 = require("../../models/enums/activation-status.js");
const service_category_contract_js_1 = require("../../databases/contracts/service-category.contract.js");
const query_schema_js_1 = require("./query.schema.js");
exports.createServiceCategorySchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty({ error: 'Name is required', }).max(256, { error: 'Name must be at most 256 characters', }),
    description: zod_1.z.string().trim().max(4096, { error: 'Description must be at most 4096 characters', }).optional(),
    picturePath: zod_1.z.string().trim().nonempty({ error: 'Profile picture path cannot be empty', }).optional(),
}).strict();
exports.updateServiceCategorySchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty({ error: 'Name cannot be empty', }).max(256, { error: 'Name must be at most 256 characters', }).optional(),
    description: zod_1.z.string().trim().max(4096, { error: 'Description must be at most 4096 characters', }).optional(),
    picturePath: zod_1.z.string().trim().nonempty({ error: 'Profile picture path cannot be empty', }).optional(),
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus, { error: 'Invalid activation status', }).optional(),
}).strict();
exports.serviceCategoryFilterSchema = zod_1.z.object({
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus, { error: 'Invalid activation status filter', }).optional(),
}).strict();
exports.queryServiceCategorySchema = query_schema_js_1.querySchema.extend({
    search: zod_1.z.string().trim().nonempty({ error: 'Search cannot be empty', }).max(320, { error: 'Search must be at most 320 characters', }).optional(),
    filter: exports.serviceCategoryFilterSchema.optional(),
    sortBy: zod_1.z.enum([service_category_contract_js_1.SORT_BY_NAME, service_category_contract_js_1.SORT_BY_CREATED_AT_UTC], { error: 'Invalid sort field', }).optional(),
}).strict();
