import express from "express";

import {
    handleGetAppointments,
    handleGetAppointment,
    handleGetUserAppointment,
    handleCreateAppointment,
    handleUpdateAppointmentByUser,
    handleConfirmAppointment,
    handleCancelAppointment,
    handlePayAppointment,
} from "../controllers/appointment.controller.js";

import {
    authenticateToken,
} from "../controllers/authentication/jwt.authentication.controller.js";

import {
    authorize,
} from "../middlewares/authorization/authorization.js";

import {
    validateBody,
    validateParameter,
    validateQuery,
} from "../middlewares/validaiton.js";

import {
    createAppointmentSchema,
    updateAppointmentSchemaByUser,
    confirmAppointmentSchema,
    payAppointmentSchema,
    queryAppointmentSchema,
} from "../middlewares/zod-schemas/appointment.schema.js";

import {
    validateUuid,
} from "../middlewares/zod-schemas/parameters.schema.js";


export const appointmentRouter = express.Router();


appointmentRouter.get(
    "/me",
    authenticateToken,
    validateQuery(queryAppointmentSchema),
    handleGetAppointments,
);


appointmentRouter.get(
    "/:appointmentUuid",
    authenticateToken,
    validateParameter(validateUuid, "appointmentUuid"),
    handleGetUserAppointment,
);


appointmentRouter.post(
    "/",
    authenticateToken,
    validateBody(createAppointmentSchema),
    handleCreateAppointment,
);


appointmentRouter.patch(
    "/:appointmentUuid",
    authenticateToken,
    validateParameter(validateUuid, "appointmentUuid"),
    validateBody(updateAppointmentSchemaByUser),
    handleUpdateAppointmentByUser,
);


appointmentRouter.patch(
    "/:appointmentUuid/confirm",
    authenticateToken,
    validateParameter(validateUuid, "appointmentUuid"),
    validateBody(confirmAppointmentSchema),
    handleConfirmAppointment,
);


appointmentRouter.patch(
    "/:appointmentUuid/cancel",
    authenticateToken,
    validateParameter(validateUuid, "appointmentUuid"),
    handleCancelAppointment,
);


appointmentRouter.patch(
    "/:appointmentUuid/pay",
    authenticateToken,
    validateParameter(validateUuid, "appointmentUuid"),
    validateBody(payAppointmentSchema),
    handlePayAppointment,
);