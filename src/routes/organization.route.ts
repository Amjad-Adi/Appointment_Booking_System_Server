import express from "express";
import {validateBodyByRole, validateParameter, validateQuery} from "../middlewares/validaiton";
import {
    createOrganizationByAdminSchema,
    createOrganizationSchema,
    queryOrganizationSchema,
    updateOrganizationByAdminSchema,
    updateOrganizationSchema
} from "../middlewares/zod-schemas/organization.schema"
import {
    handleCreateOrganization,
    handleGetOrganizations,
    handleGetOrganization, handleUpdateOrganization
} from "../controllers/organization.controller";
import { authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {authorize} from "../middlewares/authorization/authorization";
import {
    CREATE_ORGANIZATION, READ_ORGANIZATIONS,
    UPDATE_ORGANIZATION,
} from "../permissions/permissions";
import {serviceRouter} from "./service.route";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema";
import { organizationInvitationsRouter} from "./invitation.route";
import { Role } from "../models/enums/roles";
import {roomRouter} from "./room.route";
import {workingHoursRouter} from "./working-hours-route";
import {organizationAppointmentRouter} from "./organization-appointment.route";
import {timeBlockRouter} from "./time-block.route";
import {specialDaysRouter} from "./special-day.route";
import {schedulingRouter} from "./scheduling.route";
import { handleSingleUpload } from '../config/multer';
import { CLOUDINARY_PICTURE_PATH } from '../databases/contracts/organization.contract';
const updateRoleSchemas={
    [Role.SUPER_ADMIN]:updateOrganizationByAdminSchema,
    [Role.OWNER]:updateOrganizationSchema,
};
const createRoleSchemas={
    [Role.SUPER_ADMIN]:createOrganizationByAdminSchema,
    [Role.OWNER]:createOrganizationSchema,
};
export const organizationRouter=express.Router()
organizationRouter
    .route("/")
    .get(authenticateToken,authorize(READ_ORGANIZATIONS),validateQuery(queryOrganizationSchema), handleGetOrganizations)
    .post(authenticateToken, authorize(CREATE_ORGANIZATION),validateBodyByRole(createRoleSchemas),handleCreateOrganization);
organizationRouter.use("/:organizationUuid/services",validateParameter(validateUuid,"organizationUuid"),serviceRouter)
organizationRouter.use("/:organizationUuid/rooms",validateParameter(validateUuid,"organizationUuid"),roomRouter)
organizationRouter.use("/:organizationUuid/invitations",validateParameter(validateUuid,"organizationUuid"),organizationInvitationsRouter)
organizationRouter.use("/:organizationUuid/working-hours",validateParameter(validateUuid,"organizationUuid"),workingHoursRouter)
organizationRouter.use("/:organizationUuid/appointments", validateParameter(validateUuid, "organizationUuid"), organizationAppointmentRouter);
organizationRouter.use("/:organizationUuid/time-blocks", validateParameter(validateUuid, "organizationUuid"), timeBlockRouter);
organizationRouter.use("/:organizationUuid/special-days", validateParameter(validateUuid, "organizationUuid"), specialDaysRouter);
organizationRouter.use("/:organizationUuid/scheduling", validateParameter(validateUuid, "organizationUuid"), schedulingRouter);

organizationRouter.route("/:organizationUuid")
    .get(authenticateToken,validateParameter(validateUuid,"organizationUuid"),handleGetOrganization)//parameter validation is important else it will produce 500 Internal server error because uuid of type uuid in database and this string
    .patch(authenticateToken,authorize(UPDATE_ORGANIZATION),validateParameter(validateUuid,"organizationUuid"),validateBodyByRole(updateRoleSchemas), handleSingleUpload(CLOUDINARY_PICTURE_PATH),handleUpdateOrganization)