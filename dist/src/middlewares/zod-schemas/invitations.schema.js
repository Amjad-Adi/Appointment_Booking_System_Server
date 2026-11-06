"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryInvitationSchema = exports.invitationFilterSchema = exports.updateInvitationSchema = exports.createInvitationSchema = void 0;
const zod_1 = require("zod");
const roles_js_1 = require("../../models/enums/roles.js");
const invitation_status_js_1 = require("../../models/enums/invitation-status.js");
const query_schema_js_1 = require("./query.schema.js");
const invitation_contract_js_1 = require("../../databases/contracts/invitation.contract.js");
exports.createInvitationSchema = zod_1.z
    .object({
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email({
        error: "Invalid email address",
    }),
    role: zod_1.z.enum([
        roles_js_1.Role.OWNER,
        roles_js_1.Role.MANAGER,
        roles_js_1.Role.CRM,
        roles_js_1.Role.WORKER,
    ], {
        error: "Invalid invitation role",
    }),
    expiresAtUTC: zod_1.z
        .string()
        .trim()
        .min(1, {
        error: "Invitation expiration is required",
    }),
})
    .strict();
exports.updateInvitationSchema = zod_1.z
    .object({
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email({
        error: "Invalid email address",
    })
        .optional(),
    role: zod_1.z
        .enum([
        roles_js_1.Role.OWNER,
        roles_js_1.Role.MANAGER,
        roles_js_1.Role.CRM,
        roles_js_1.Role.WORKER,
    ], {
        error: "Invalid invitation role",
    })
        .optional(),
    expiresAtUTC: zod_1.z
        .string()
        .trim()
        .min(1, {
        error: "Invitation expiration is required",
    })
        .optional(),
    status: zod_1.z
        .enum([
        invitation_status_js_1.InvitationStatus.CANCELLED,
        invitation_status_js_1.InvitationStatus.EXPIRED,
    ])
        .optional(),
})
    .strict();
exports.invitationFilterSchema = zod_1.z
    .object({
    organizationUuid: zod_1.z
        .uuid()
        .optional(),
    status: zod_1.z
        .enum(invitation_status_js_1.InvitationStatus)
        .optional(),
})
    .strict();
exports.queryInvitationSchema = query_schema_js_1.querySchema
    .extend({
    search: zod_1.z
        .string()
        .trim()
        .max(320)
        .optional(),
    filter: exports.invitationFilterSchema
        .optional(),
    sortBy: zod_1.z
        .enum([
        invitation_contract_js_1.SORT_BY_CREATED_AT_UTC,
        invitation_contract_js_1.SORT_BY_EXPIRES_AT_UTC,
    ])
        .optional(),
})
    .strict();
