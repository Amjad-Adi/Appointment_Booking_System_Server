import express from "express";
import {userRouter} from "./user.route";
import {organizationRouter} from "./organization.route";
import {authenticationRouter} from "./authentication.route";
import {publicServiceRoute} from "./service.route";
import {serviceCategoryRouter} from "./service-category.route";
import {publicRoomRoute} from "./room.route";
import {appointmentRouter} from "./apppointment.route";
import {publicInvitationsRouter} from "./invitation.route";
import { generalRateLimiter } from '../middlewares/rate-limiter-instances';
import { healthRoute } from './health.route';

export const mainRouter=express.Router()
mainRouter.use("/auth",authenticationRouter)

mainRouter.use(generalRateLimiter);
mainRouter.use("/users",userRouter)
mainRouter.use("/organizations",organizationRouter)
mainRouter.use("/invitations", publicInvitationsRouter)
mainRouter.use("/services/categories",serviceCategoryRouter)
mainRouter.use("/services",publicServiceRoute)
mainRouter.use("/rooms",publicRoomRoute)
mainRouter.use("/appointments", appointmentRouter);
mainRouter.use("/health", healthRoute);