"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganizationByAdminSchema = exports.queryOrganizationSchema = exports.organizationFilterSchema = exports.updateOrganizationByAdminSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
const activation_status_js_1 = require("../../models/enums/activation-status.js");
const location_schema_js_1 = require("./location.schema.js");
const query_schema_1 = require("./query.schema");
const organization_contract_1 = require("../../databases/contracts/organization.contract");
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty().max(256),
    email: zod_1.z.email(),
    phoneNumber: zod_1.z.e164(),
    bio: zod_1.z.string().trim().nonempty().max(4096).optional(),
    location: location_schema_js_1.createLocationSchema,
    profilePicturePath: zod_1.z.string().trim().nonempty().optional()
}).strict();
exports.updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty().max(256).optional(),
    bio: zod_1.z.string().trim().nonempty().max(4096).optional(),
    phoneNumber: zod_1.z.e164().optional(),
    location: location_schema_js_1.updateLocationSchema.optional(),
    profilePicturePath: zod_1.z.string().trim().nonempty().optional(),
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus).optional()
}).strict();
exports.updateOrganizationByAdminSchema = zod_1.z.object({
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus).optional()
}).strict();
exports.organizationFilterSchema = zod_1.z.object({
    status: zod_1.z.enum(activation_status_js_1.ActivationStatus).optional(),
}).strict();
exports.queryOrganizationSchema = query_schema_1.querySchema
    .extend({
    search: zod_1.z.string().trim().nonempty().max(320).optional(),
    filter: exports.organizationFilterSchema.optional(),
    sortBy: zod_1.z.enum([organization_contract_1.SORT_BY_NAME, organization_contract_1.SORT_BY_CREATED_AT_UTC,]).optional(),
})
    .strict();
exports.createOrganizationByAdminSchema = zod_1.z.object({
    name: zod_1.z.string().trim().nonempty().max(256),
    email: zod_1.z.email(),
    phoneNumber: zod_1.z.e164(),
    bio: zod_1.z.string().trim().nonempty().max(4096).optional(),
    location: location_schema_js_1.createLocationSchema,
    profilePicturePath: zod_1.z.string().trim().nonempty().optional(),
    userEmail: zod_1.z.email(),
}).strict();
