"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specialDaysRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_js_1 = require("../middlewares/validaiton.js");
const special_days_controller_js_1 = require("../controllers/special-days.controller.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
const authorization_js_1 = require("../middlewares/authorization/authorization.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
const special_days_schema_js_1 = require("../middlewares/zod-schemas/special-days.schema.js");
const permissions_js_1 = require("../permissions/permissions.js");
exports.specialDaysRouter = express_1.default.Router({
    mergeParams: true,
});
exports.specialDaysRouter
    .route("/")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateQuery)(special_days_schema_js_1.querySpecialDaySchema), special_days_controller_js_1.handleGetOrganizationSpecialDays)
    .post(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.CREATE_SPECIAL_DAY), (0, validaiton_js_1.validateBody)(special_days_schema_js_1.createSpecialDaySchema), special_days_controller_js_1.handleCreateOrganizationSpecialDay);
exports.specialDaysRouter
    .route("/today")
    .get(jwt_authentication_controller_js_1.authenticateToken, special_days_controller_js_1.handleIsTodaySpecialDay);
exports.specialDaysRouter
    .route("/:specialDayUuid")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "specialDayUuid"), special_days_controller_js_1.handleGetOrganizationSpecialDay)
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.UPDATE_SPECIAL_DAY), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "specialDayUuid"), (0, validaiton_js_1.validateBody)(special_days_schema_js_1.updateSpecialDaySchema), special_days_controller_js_1.handleUpdateOrganizationSpecialDay);
