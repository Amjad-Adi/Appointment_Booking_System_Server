import express from "express";
import {validateBody, validateBodyByRole, validateParameter, validateQuery} from "../middlewares/validaiton.js";
import {
    createOrganizationByAdminSchema,
    createOrganizationSchema,
    queryOrganizationSchema,
    updateOrganizationByAdminSchema,
    updateOrganizationSchema
} from "../middlewares/zod-schemas/organization.schema.js"
import {
    handleCreateOrganization,
    handleGetOrganizations,
    handleGetOrganization, handleUpdateOrganization
} from "../controllers/organization.controller.js";
import { authenticateToken} from "../controllers/authentication/jwt.authentication.controller.js";
import {authorize} from "../middlewares/authorization/authorization.js";
import {
    CREATE_ORGANIZATION,
    UPDATE_ORGANIZATION,
} from "../permissions/permissions.js";
import {serviceRouter} from "./service.route.js";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema.js";
import {sendInvitationRouter} from "./sent-invitation.route.js";
import { Role } from "../models/enums/roles.js";
import {roomRouter} from "./room.route.js";
import {workingHoursRouter} from "./working-hours-route";
import {organizationAppointmentRouter} from "./organization-appointment.route";
import {timeBlockRouter} from "./time-block.route";
import {specialDaysRouter} from "./special-day.route";
import {schedulingRouter} from "./scheduling.route";
const updateRoleSchemas={
    [Role.SUPER_ADMIN]:updateOrganizationByAdminSchema,
    [Role.OWNER]:updateOrganizationSchema,
};
const createRoleSchemas={
    [Role.SUPER_ADMIN]:updateOrganizationByAdminSchema,
    [Role.OWNER]:updateOrganizationSchema,
};
export const organizationRouter=express.Router()
organizationRouter
    .route("/")
    .get(authenticateToken, validateQuery(queryOrganizationSchema), handleGetOrganizations)
    .post(authenticateToken, authorize(CREATE_ORGANIZATION), validateBodyByRole(createRoleSchemas), handleCreateOrganization);
organizationRouter.use("/:organizationUuid/services",validateParameter(validateUuid,"organizationUuid"),serviceRouter)
organizationRouter.use("/:organizationUuid/rooms",validateParameter(validateUuid,"organizationUuid"),roomRouter)
organizationRouter.use("/:organizationUuid/invitations",validateParameter(validateUuid,"organizationUuid"),sendInvitationRouter)
organizationRouter.use("/:organizationUuid/working-hours",validateParameter(validateUuid,"organizationUuid"),workingHoursRouter)
organizationRouter.use("/:organizationUuid/appointments", validateParameter(validateUuid, "organizationUuid"), organizationAppointmentRouter);
organizationRouter.use("/:organizationUuid/time-blocks", validateParameter(validateUuid, "organizationUuid"), timeBlockRouter);
organizationRouter.use("/:organizationUuid/special-days", validateParameter(validateUuid, "organizationUuid"), specialDaysRouter);
organizationRouter.use("/:organizationUuid/scheduling", validateParameter(validateUuid, "organizationUuid"), schedulingRouter);

organizationRouter.route("/:organizationUuid")
    .get(authenticateToken,validateParameter(validateUuid,"organizationUuid"),handleGetOrganization)//parameter validation is important else it will produce 500 Internal server error because uuid of type uuid in database and this string
    .patch(authenticateToken,authorize(UPDATE_ORGANIZATION),validateParameter(validateUuid,"organizationUuid"),validateBodyByRole(updateRoleSchemas),handleUpdateOrganization)