"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const roles_permissions_js_1 = require("../../permissions/roles-permissions.js");
const forbidden_error_js_1 = require("../../errors/forbidden.error.js");
function authorize(permission) {
    return function (req, res, next) {
        const role = req.user?.role;
        if (!role) {
            throw new forbidden_error_js_1.ForbiddenError();
        }
        if (roles_permissions_js_1.rolesPermissions[role]?.includes(permission)) {
            next();
        }
        else {
            throw new forbidden_error_js_1.ForbiddenError();
        }
    };
}
