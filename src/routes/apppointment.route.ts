import express from "express";

import {
    handleGetAppointments,
    handleGetUserAppointment,
    handleCreateAppointment,
    handleUpdateAppointmentByUser,
    handleCancelAppointment,
} from "../controllers/appointment.controller";

import {
    authenticateToken,
} from "../controllers/authentication/jwt.authentication.controller";

import {
    validateBody,
    validateParameter,
    validateQuery,
} from "../middlewares/validaiton";

import {
    createAppointmentSchema,
    updateAppointmentSchemaByUser,
    queryAppointmentSchema,
} from "../middlewares/zod-schemas/appointment.schema";

import {
    validateUuid,
} from "../middlewares/zod-schemas/parameters.schema";

export const appointmentRouter =
    express.Router();

appointmentRouter.get(
    "/me",
    authenticateToken,
    validateQuery(
        queryAppointmentSchema,
    ),
    handleGetAppointments,
);

appointmentRouter.get(
    "/:appointmentUuid",
    authenticateToken,
    validateParameter(
        validateUuid,
        "appointmentUuid",
    ),
    handleGetUserAppointment,
);

appointmentRouter.post(
    "/",
    authenticateToken,
    validateBody(
        createAppointmentSchema,
    ),
    handleCreateAppointment,
);

appointmentRouter.patch(
    "/:appointmentUuid",
    authenticateToken,
    validateParameter(
        validateUuid,
        "appointmentUuid",
    ),
    validateBody(
        updateAppointmentSchemaByUser,
    ),
    handleUpdateAppointmentByUser,
);

appointmentRouter.patch(
    "/:appointmentUuid/cancel",
    authenticateToken,
    validateParameter(
        validateUuid,
        "appointmentUuid",
    ),
    handleCancelAppointment,
);
