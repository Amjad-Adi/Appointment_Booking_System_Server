import express from "express";
import {login, logOut, refreshToken} from  "../controllers/authentication/authentication-management.controller.js";
import {validateBody} from "../middlewares/validaiton.js";
import {createUserSchema, loginUserSchema} from "../middlewares/zod-schemas/user.schema.js";
import {RATE_LIMIT_FOR_AUTHENTICATION, rateLimit, rateLimiterFactory} from "../middlewares/rate-limiter.js";
import {authorize} from "../middlewares/authorization/authorization.js";
import {READ_USERS} from "../permissions/permissions.js";
import {userRouter} from "./user.route.js";
import { handleCreateUser } from "../controllers/user.controller.js";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller.js";
export const authenticationRouter=express.Router()

userRouter.route("/register")
    .post(validateBody(createUserSchema),handleCreateUser)

authenticationRouter.route("/login")
    .post(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_AUTHENTICATION)),validateBody(loginUserSchema),login);

authenticationRouter.route("/logout")
    .get(authenticateToken,logOut);

authenticationRouter.route("/refresh")
    .get(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_AUTHENTICATION)),refreshToken);