import { Router } from "express";

import { handleGetAvailableTimes } from "../controllers/scheduling.controller.js";

import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller.js';
import {
    validateBody,
} from "../middlewares/validaiton.js";

import {
    schedulingSchema,
} from "../middlewares/zod-schemas/scheduling.schema.js";

export const schedulingRouter = Router({mergeParams: true});

schedulingRouter.post(
    "/",
    authenticateToken,
    validateBody(schedulingSchema),
    handleGetAvailableTimes,
);