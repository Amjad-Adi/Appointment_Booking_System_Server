"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeBlockRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_js_1 = require("../middlewares/validaiton.js");
const time_block_controller_js_1 = require("../controllers/time-block.controller.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
const authorization_js_1 = require("../middlewares/authorization/authorization.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
const time_block_schema_js_1 = require("../middlewares/zod-schemas/time-block.schema.js");
const permissions_js_1 = require("../permissions/permissions.js");
exports.timeBlockRouter = express_1.default.Router({
    mergeParams: true,
});
exports.timeBlockRouter
    .route("/")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateQuery)(time_block_schema_js_1.queryTimeBlockSchema), time_block_controller_js_1.handleGetOrganizationTimeBlocks)
    .post(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateBody)(time_block_schema_js_1.createTimeBlockSchema), time_block_controller_js_1.handleCreateOrganizationTimeBlock);
exports.timeBlockRouter
    .route("/:timeBlockUuid")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "timeBlockUuid"), time_block_controller_js_1.handleGetOrganizationTimeBlock)
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.UPDATE_TIME_BLOCK), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "timeBlockUuid"), (0, validaiton_js_1.validateBody)(time_block_schema_js_1.updateTimeBlockSchema), time_block_controller_js_1.handleUpdateOrganizationTimeBlock);
