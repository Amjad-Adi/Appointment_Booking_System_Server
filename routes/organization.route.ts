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
import {authorize, authorizeOrganizationUser, rejectWorkingUsers} from "../authoraization/autoraization";
import {
    CREATE_ORGANIZATION,
    WRITE_ORGANIZATION, WRITE_ORGANIZATION_AS_ADMIN,
} from "../permissions/permissions";
import {serviceRouter} from "./service.route";
import {validateUuid} from "../middlewares/schemas/parameters.schema";
import {invitationRouter} from "./invitation.route";
import { Role } from "../models/enums/roles";
import {z, ZodType} from "zod";
const roleSchemas={
    [Role.SUPER_ADMIN]:updateOrganizationByAdminSchema,
    [Role.OWNER]:updateOrganizationSchema,
};
export let organizationRouter=express.Router()
organizationRouter.route("/")
    .get(handleGetOrganizations)
    .post(authenticateToken,authorize(CREATE_ORGANIZATION),rejectWorkingUsers,validateBody(createOrganizationSchema),handleCreateOrganization)

organizationRouter.use("/:organizationUuid/services",validateParameter(validateUuid,"organizationUuid"),serviceRouter)
organizationRouter.route("/:organizationUuid")
    .get(authenticateToken,validateParameter(validateUuid,"organizationUuid"),handleGetOrganization)
    .patch(authenticateToken,authorizeOrganizationUser,authorize(WRITE_ORGANIZATION),validateParameter(validateUuid,"organizationUuid"),validateBodyByRole(roleSchemas),handleUpdateOrganization)