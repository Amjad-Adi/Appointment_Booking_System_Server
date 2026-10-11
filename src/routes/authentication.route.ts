import express from "express";
import {login, logOut, refreshToken} from  "../controllers/authentication/authentication-management.controller";
import {validateBody} from "../middlewares/validaiton";
import {registerUserSchema, loginUserSchema} from "../middlewares/zod-schemas/user.schema";
import {userRouter} from "./user.route";
import { handleCreateUser } from "../controllers/user.controller";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import { authenticationRateLimiter, generalRateLimiter } from '../middlewares/rate-limiter-instances';

export const authenticationRouter=express.Router()

userRouter.route("/register")
    .post(authenticationRateLimiter,validateBody(registerUserSchema),handleCreateUser)

authenticationRouter.route("/login")
    .post(authenticationRateLimiter,validateBody(loginUserSchema),login);

authenticationRouter.route("/logout")
    .post(authenticateToken,generalRateLimiter,logOut);

authenticationRouter.route("/refresh")
    .post(generalRateLimiter,refreshToken);