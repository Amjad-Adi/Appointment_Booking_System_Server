import express from "express";
import {userRouter} from "./user.route";
import {organizationRouter} from "./organization.route";
import {authenticationRouter} from "./authentication.route";
import {app} from "../app";
import {RATE_LIMIT_FOR_GENERAL, rateLimit, rateLimiterFactory} from "../middlewares/rate-limiter";

export let mainRouter=express.Router()

mainRouter.use(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_GENERAL)));
mainRouter.use("/users",userRouter)
mainRouter.use("/organizations",organizationRouter)
mainRouter.use("/auth",authenticationRouter)