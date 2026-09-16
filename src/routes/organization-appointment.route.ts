import express from "express";

import {
    handleGetOrganizationAppointments,
    handleGetOrganizationAppointment,
    handleUpdateAppointmentByOrganization,
    handleApproveAppointment,
    handleRejectAppointment,
    handleUpdateAppointmentStatus, handleCreateAppointment,
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
    updateAppointmentSchemaByOrganization,
    rejectAppointmentSchemaBy,
    updateAppointmentSchemaStatus,
    queryAppointmentSchema, createAppointmentSchema,createOrganizationAppointmentSchema
} from "../middlewares/zod-schemas/appointment.schema.js";

import {
    ORGANIZATION_APPOINTMENT_MANAGEMENT,
} from "../permissions/permissions.js";

import {
    validateUuid,
} from "../middlewares/zod-schemas/parameters.schema.js";
import {appointmentRouter} from "./apppointment.route";


export const organizationAppointmentRouter = express.Router({
    mergeParams: true,
});


organizationAppointmentRouter.get(
    "/",
    authenticateToken,
    authorize(ORGANIZATION_APPOINTMENT_MANAGEMENT),
    validateQuery(queryAppointmentSchema),
    handleGetOrganizationAppointments,
);


organizationAppointmentRouter.get(
    "/:appointmentUuid",
    authenticateToken,
    authorize(ORGANIZATION_APPOINTMENT_MANAGEMENT),
    validateParameter(validateUuid, "appointmentUuid"),
    handleGetOrganizationAppointment,
);


organizationAppointmentRouter.post(
        "/",
        authenticateToken,
        validateBody(createOrganizationAppointmentSchema),
        handleCreateAppointment,
);



organizationAppointmentRouter.patch(
    "/:appointmentUuid",
    authenticateToken,
    authorize(ORGANIZATION_APPOINTMENT_MANAGEMENT),
    validateParameter(validateUuid, "appointmentUuid"),
    validateBody(updateAppointmentSchemaByOrganization),
    handleUpdateAppointmentByOrganization,
);


organizationAppointmentRouter.patch(
    "/:appointmentUuid/approve",
    authenticateToken,
    authorize(ORGANIZATION_APPOINTMENT_MANAGEMENT),
    validateParameter(validateUuid, "appointmentUuid"),
    handleApproveAppointment,
);


organizationAppointmentRouter.patch(
    "/:appointmentUuid/reject",
    authenticateToken,
    authorize(ORGANIZATION_APPOINTMENT_MANAGEMENT),
    validateParameter(validateUuid, "appointmentUuid"),
    validateBody(rejectAppointmentSchemaBy),
    handleRejectAppointment,
);


organizationAppointmentRouter.patch(
    "/:appointmentUuid/status",
    authenticateToken,
    authorize(ORGANIZATION_APPOINTMENT_MANAGEMENT),
    validateParameter(validateUuid, "appointmentUuid"),
    validateBody(updateAppointmentSchemaStatus),
    handleUpdateAppointmentStatus,
);