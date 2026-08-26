import express from "express";
import {userRouter} from "./user.route.js";
import {organizationRouter} from "./organization.route.js";
import {authenticationRouter} from "./authentication.route.js";
import {app} from "../../app.js";
import {RATE_LIMIT_FOR_GENERAL, rateLimit, rateLimiterFactory} from "../middlewares/rate-limiter.js";
import {receiveInvitationRouter} from "./receive-invitation.route.js";

export const mainRouter=express.Router()

mainRouter.use(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_GENERAL)));
mainRouter.use("/users",userRouter)
mainRouter.use("/organizations",organizationRouter)
mainRouter.use("/auth",authenticationRouter)
mainRouter.use("/invitations", receiveInvitationRouter)