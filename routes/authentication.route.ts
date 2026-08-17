import express from "express";
import {login, logOut, refreshToken} from "../controllers/authentication/authentication-management.controller";
import {validateBody} from "../middlewares/validaiton";
import {createUserSchema, loginUserSchema} from "../middlewares/zod-schemas/user.schema";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {RATE_LIMIT_FOR_AUTHENTICATION, rateLimit, rateLimiterFactory} from "../middlewares/rate-limiter";
import {authorize} from "../middlewares/authorization/authorization";
import {READ_USERS} from "../permissions/permissions";
import {userRouter} from "./user.route";
import { handleCreateUser } from "../controllers/user.controller";
export let authenticationRouter=express.Router()

userRouter.route("/register")
    .post(validateBody(createUserSchema),handleCreateUser)

authenticationRouter.route("/login")
    .post(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_AUTHENTICATION)),validateBody(loginUserSchema),login);

authenticationRouter.route("/logout")
    .get(authenticateToken,logOut);

authenticationRouter.route("/refresh")
    .get(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_AUTHENTICATION)),refreshToken);