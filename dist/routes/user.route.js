"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_1 = require("../middlewares/validaiton");
const user_schema_1 = require("../middlewares/schemas/user.schema");
const user_controller_1 = require("../controllers/user.controller");
const autoraization_1 = require("../middlewares/authoraization/autoraization");
const permissions_1 = require("../permissions/permissions");
const jwt_authentication_controller_1 = require("../controllers/authentication/jwt.authentication.controller");
const parameters_schema_1 = require("../middlewares/schemas/parameters.schema");
exports.userRouter = express_1.default.Router();
exports.userRouter.route("/")
    .get(jwt_authentication_controller_1.authenticateToken, (0, autoraization_1.authorize)(permissions_1.READ_USERS), user_controller_1.handleGetUsers);
exports.userRouter.route("/me")
    .get(jwt_authentication_controller_1.authenticateToken, user_controller_1.handleGetCurrentUser)
    .patch(jwt_authentication_controller_1.authenticateToken, (0, validaiton_1.validateBody)(user_schema_1.updateUserSchema), user_controller_1.handleUpdateCurrentUser);
exports.userRouter.route("/register")
    .post((0, validaiton_1.validateBody)(user_schema_1.createUserSchema), user_controller_1.handleCreateUser);
exports.userRouter.route("/:userUuid")
    .get(jwt_authentication_controller_1.authenticateToken, (0, autoraization_1.authorize)(permissions_1.READ_USER), (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "userUuid"), user_controller_1.handleGetUser)
    .patch(jwt_authentication_controller_1.authenticateToken, (0, autoraization_1.authorize)(permissions_1.WRITE_USER_AS_ADMIN), (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "userUuid"), (0, validaiton_1.validateBody)(user_schema_1.updateUserByAdminSchema), user_controller_1.handleUpdateUserByAdmin);
