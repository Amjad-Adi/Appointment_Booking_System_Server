
import express from "express";

import {
    handleGetOrganizationAppointments,
    handleGetOrganizationAppointment,
    handleCreateOrganizationAppointment,
    handleUpdateAppointmentByOrganization,
} from "../controllers/appointment.controller";

import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import { authorize } from "../middlewares/authorization/authorization";

import {
    validateBody,
    validateParameter,
    validateQuery,
} from "../middlewares/validaiton";

import {
    createOrganizationAppointmentSchema,
    updateAppointmentSchemaByOrganization,
    queryAppointmentSchema,
} from "../middlewares/zod-schemas/appointment.schema";

import { ORGANIZATION_APPOINTMENT_MANAGEMENT } from "../permissions/permissions";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema";

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
    authorize(ORGANIZATION_APPOINTMENT_MANAGEMENT),
    validateBody(createOrganizationAppointmentSchema),
    handleCreateOrganizationAppointment,
);

organizationAppointmentRouter.patch(
    "/:appointmentUuid",
    authenticateToken,
    authorize(ORGANIZATION_APPOINTMENT_MANAGEMENT),
    validateParameter(validateUuid, "appointmentUuid"),
    validateBody(updateAppointmentSchemaByOrganization),
    handleUpdateAppointmentByOrganization,
);
