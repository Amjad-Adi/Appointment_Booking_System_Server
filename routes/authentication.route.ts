import express from "express";
import {login, logOut, refreshToken} from "../controllers/authentication/authentication-management.controller";
import {validateBody} from "../middlewares/validaiton";
import {loginUserSchema} from "../middlewares/schemas/user.schema";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {RATE_LIMIT_FOR_AUTHENTICATION, rateLimit, rateLimiterFactory} from "../middlewares/rate-limiter";
export let authenticationRouter=express.Router()
authenticationRouter.route("/login")
    .post(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_AUTHENTICATION)),validateBody(loginUserSchema),login);

authenticationRouter.route("/logout")
    .post(authenticateToken,logOut);

authenticationRouter.route("/refresh")
    .post(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_AUTHENTICATION)),refreshToken);