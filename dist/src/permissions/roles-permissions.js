"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesPermissions = void 0;
const permissions_js_1 = require("./permissions.js");
const roles_js_1 = require("../models/enums/roles.js");
const customerPermissions = [];
const workerPermissions = [];
const crmPermissions = [
    permissions_js_1.READ_USERS, permissions_js_1.UPDATE_WORKING_HOURS, permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT, permissions_js_1.UPDATE_TIME_BLOCK, permissions_js_1.CREATE_SPECIAL_DAY
];
const managerPermissions = [
    permissions_js_1.READ_ORGANIZATION_INVITATIONS,
    permissions_js_1.CREATE_ORGANIZATION_INVITATIONS,
    permissions_js_1.CREATE_SERVICE,
    permissions_js_1.UPDATE_SERVICE,
    permissions_js_1.READ_USERS,
    permissions_js_1.CREATE_ROOM,
    permissions_js_1.UPDATE_ROOM, permissions_js_1.UPDATE_WORKING_HOURS, permissions_js_1.ORGANIZATION_APPOINTMENT_MANAGEMENT, permissions_js_1.CREATE_SPECIAL_DAY, permissions_js_1.UPDATE_ORGANIZATION_INVITATIONS
];
const ownerPermissions = [
    ...managerPermissions,
    permissions_js_1.CREATE_ORGANIZATION,
    permissions_js_1.UPDATE_ORGANIZATION
];
const superAdminPermissions = [
    permissions_js_1.UPDATE_USER_AS_ADMIN,
    permissions_js_1.UPDATE_ORGANIZATION_AS_ADMIN,
    permissions_js_1.CREATE_USER,
    permissions_js_1.READ_USERS,
    permissions_js_1.CREATE_SERVICE_CATEGORY,
    permissions_js_1.CREATE_SERVICE_CATEGORY, permissions_js_1.UPDATE_ORGANIZATION_INVITATIONS
];
exports.rolesPermissions = {
    [roles_js_1.Role.SUPER_ADMIN]: superAdminPermissions,
    [roles_js_1.Role.OWNER]: ownerPermissions,
    [roles_js_1.Role.MANAGER]: managerPermissions,
    [roles_js_1.Role.CRM]: crmPermissions,
    [roles_js_1.Role.WORKER]: workerPermissions,
    [roles_js_1.Role.CUSTOMER]: customerPermissions,
};
