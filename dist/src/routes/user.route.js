"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_js_1 = require("../middlewares/validaiton.js");
const user_schema_js_1 = require("../middlewares/zod-schemas/user.schema.js");
const user_controller_js_1 = require("../controllers/user.controller.js");
const authorization_js_1 = require("../middlewares/authorization/authorization.js");
const permissions_js_1 = require("../permissions/permissions.js");
const parameters_schema_js_1 = require("../middlewares/zod-schemas/parameters.schema.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
exports.userRouter = express_1.default.Router();
exports.userRouter.route("/")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.READ_USERS), (0, validaiton_js_1.validateQuery)(user_schema_js_1.queryUserSchema), user_controller_js_1.handleGetUsers)
    .post(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.CREATE_USER), user_controller_js_1.handleCreateUser);
exports.userRouter.route("/me")
    .get(jwt_authentication_controller_js_1.authenticateToken, user_controller_js_1.handleGetCurrentUser)
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, validaiton_js_1.validateBody)(user_schema_js_1.updateUserSchema), user_controller_js_1.handleUpdateCurrentUser);
exports.userRouter.route("/:userUuid")
    .get(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.READ_USERS), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "userUuid"), user_controller_js_1.handleGetUser)
    .patch(jwt_authentication_controller_js_1.authenticateToken, (0, authorization_js_1.authorize)(permissions_js_1.UPDATE_USER_AS_ADMIN), (0, validaiton_js_1.validateParameter)(parameters_schema_js_1.validateUuid, "userUuid"), (0, validaiton_js_1.validateBody)(user_schema_js_1.updateUserByAdminSchema), user_controller_js_1.handleUpdateUserByAdmin);
