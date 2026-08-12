import express from "express";
import {login, logOut, refreshToken} from "../controllers/authentication/authentication-management.controller";
import {validateBody} from "../middlewares/validaiton";
import {loginUserSchema} from "../middlewares/schemas/user.schema";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
export let authenticationRouter=express.Router()
authenticationRouter.route("/login")
    .post(validateBody(loginUserSchema),login);

authenticationRouter.route("/logout")
    .post(authenticateToken,logOut);

authenticationRouter.route("/refresh")
    .post(refreshToken);