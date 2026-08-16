import express from "express";
import {validateBody, validateBodyByRole, validateParameter} from "../middlewares/validaiton";
import {createOrganizationSchema, updateOrganizationByAdminSchema,updateOrganizationSchema} from "../middlewares/schemas/organization.schema"
import {
    handleCreateOrganization,
    handleGetOrganizations,
    handleUpdateOrganizationByAdmin,
    handleGetOrganization, handleUpdateOrganization
} from "../controllers/organization.controller";
import { authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {authorize,rejectWorkingUsers,authorizeOrganizationUser} from "../middlewares/authoraization/autoraization";
import {
    CREATE_ORGANIZATION,
    UPDATE_ORGANIZATION,
} from "../permissions/permissions";
import {serviceRouter} from "./service.route";
import {validateUuid} from "../middlewares/schemas/parameters.schema";
import {sendInvitationRouter} from "./send-invitation.route";
import { Role } from "../models/enums/roles";
import {z, ZodType} from "zod";
import {roomRouter} from "./room.route";
const roleSchemas={
    [Role.SUPER_ADMIN]:updateOrganizationByAdminSchema,
    [Role.OWNER]:updateOrganizationSchema,
};
export let organizationRouter=express.Router()
organizationRouter.route("/")
    .get(handleGetOrganizations)
    .post(authenticateToken,authorize(CREATE_ORGANIZATION),rejectWorkingUsers,validateBody(createOrganizationSchema),handleCreateOrganization)

organizationRouter.use("/:organizationUuid/services",validateParameter(validateUuid,"organizationUuid"),serviceRouter)
organizationRouter.use("/:organizationUuid/rooms",validateParameter(validateUuid,"organizationUuid"),roomRouter)
organizationRouter.use("/:organizationUuid/invitations",validateParameter(validateUuid,"organizationUuid"),sendInvitationRouter)
organizationRouter.route("/:organizationUuid")
    .get(validateParameter(validateUuid,"organizationUuid"),handleGetOrganization)//parameter validation is important else it will produce 500 Internal server error because uuid of type uuid in database and this string
    .patch(authenticateToken,authorizeOrganizationUser,authorize(UPDATE_ORGANIZATION),validateParameter(validateUuid,"organizationUuid"),validateBodyByRole(roleSchemas),handleUpdateOrganization)