import express from "express";
import {userRouter} from "./user.route.js";
import {organizationRouter} from "./organization.route.js";
import {authenticationRouter} from "./authentication.route.js";
import {app} from "../../app.js";
import {RATE_LIMIT_FOR_GENERAL, rateLimit, rateLimiterFactory} from "../middlewares/rate-limiter.js";
import {publicServiceRoute} from "./service.route";
import {serviceCategoryRouter} from "./service-category.route";
import {publicRoomRoute} from "./room.route";
import {appointmentRouter} from "./apppointment.route";
import {publicInvitationsRouter} from "./invitation.route";

export const mainRouter=express.Router()

mainRouter.use(rateLimit(rateLimiterFactory(RATE_LIMIT_FOR_GENERAL)));
mainRouter.use("/users",userRouter)
mainRouter.use("/organizations",organizationRouter)
mainRouter.use("/auth",authenticationRouter)
mainRouter.use("/invitations", publicInvitationsRouter)
mainRouter.use("/services/categories",serviceCategoryRouter)
mainRouter.use("/services",publicServiceRoute)
mainRouter.use("/rooms",publicRoomRoute)
mainRouter.use("/appointments", appointmentRouter);