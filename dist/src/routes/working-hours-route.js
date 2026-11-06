"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingHoursRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_js_1 = require("../middlewares/validaiton.js");
const working_hours_controller_js_1 = require("../controllers/working-hours.controller.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
const authorization_js_1 = require("../middlewares/authorization/authorization.js");
const permissions_js_1 = require("../permissions/permissions.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
const working_hours_schema_js_1 = require("../middlewares/zod-schemas/working-hours.schema.js");
exports.workingHoursRouter = express_1.default.Router({
    mergeParams: true,
});
/**
 * Get all working hours for an organization.
 */
exports.workingHoursRouter
    .route("/")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateQuery)(working_hours_schema_js_1.queryWorkingHoursSchema), working_hours_controller_js_1.handleGetOrganizationWorkingHours)
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.UPDATE_WORKING_HOURS), (0, validaiton_js_1.validateBody)(working_hours_schema_js_1.updateOrganizationWorkingHoursSchema), working_hours_controller_js_1.handleUpdateOrganizationWorkingHoursWeek);
/**
 * Get or update one working-hours day.
 */
exports.workingHoursRouter
    .route("/:workingHoursUuid")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "workingHoursUuid"), working_hours_controller_js_1.handleGetOrganizationWorkingHour)
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.UPDATE_WORKING_HOURS), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "workingHoursUuid"), (0, validaiton_js_1.validateBody)(working_hours_schema_js_1.updateWorkingHoursSchema), working_hours_controller_js_1.handleUpdateOrganizationWorkingHours);
