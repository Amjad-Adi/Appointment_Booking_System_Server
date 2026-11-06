"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationRouter = void 0;
const express_1 = __importDefault(require("express"));
const authentication_management_controller_js_1 = require("../controllers/authentication/authentication-management.controller.js");
const validaiton_js_1 = require("../middlewares/validaiton.js");
const user_schema_js_1 = require("../middlewares/zod-schemas/user.schema.js");
const rate_limiter_js_1 = require("../middlewares/rate-limiter.js");
const user_route_js_1 = require("./user.route.js");
const user_controller_js_1 = require("../controllers/user.controller.js");
const jwt_authentication_controller_js_1 = require("../controllers/authentication/jwt.authentication.controller.js");
exports.authenticationRouter = express_1.default.Router();
user_route_js_1.userRouter.route("/register")
    .post((0, validaiton_js_1.validateBody)(user_schema_js_1.createUserSchema), user_controller_js_1.handleCreateUser);
exports.authenticationRouter.route("/login")
    .post((0, rate_limiter_js_1.rateLimit)((0, rate_limiter_js_1.rateLimiterFactory)(rate_limiter_js_1.RATE_LIMIT_FOR_AUTHENTICATION)), (0, validaiton_js_1.validateBody)(user_schema_js_1.loginUserSchema), authentication_management_controller_js_1.login);
exports.authenticationRouter.route("/logout")
    .post(jwt_authentication_controller_js_1.authenticateToken, authentication_management_controller_js_1.logOut);
exports.authenticationRouter.route("/refresh")
    .post((0, rate_limiter_js_1.rateLimit)((0, rate_limiter_js_1.rateLimiterFactory)(rate_limiter_js_1.RATE_LIMIT_FOR_AUTHENTICATION)), authentication_management_controller_js_1.refreshToken);
