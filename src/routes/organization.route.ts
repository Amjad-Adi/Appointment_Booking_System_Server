import express from "express";
import {validateBody, validateBodyByRole, validateParameter} from "../middlewares/validaiton.js";
import {createOrganizationSchema, updateOrganizationByAdminSchema,updateOrganizationSchema} from "../middlewares/zod-schemas/organization.schema.js"
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
const roleSchemas={
    [Role.SUPER_ADMIN]:updateOrganizationByAdminSchema,
    [Role.OWNER]:updateOrganizationSchema,
};
export let organizationRouter=express.Router()
organizationRouter.route("/")
    .get(handleGetOrganizations)
    .post(authenticateToken,authorize(CREATE_ORGANIZATION),validateBody(createOrganizationSchema),handleCreateOrganization)

organizationRouter.use("/:organizationUuid/services",validateParameter(validateUuid,"organizationUuid"),serviceRouter)
organizationRouter.use("/:organizationUuid/rooms",validateParameter(validateUuid,"organizationUuid"),roomRouter)
organizationRouter.use("/:organizationUuid/invitations",validateParameter(validateUuid,"organizationUuid"),sendInvitationRouter)
organizationRouter.route("/:organizationUuid")
    .get(validateParameter(validateUuid,"organizationUuid"),handleGetOrganization)//parameter validation is important else it will produce 500 Internal server error because uuid of type uuid in database and this string
    .patch(authenticateToken,authorize(UPDATE_ORGANIZATION),validateParameter(validateUuid,"organizationUuid"),validateBodyByRole(roleSchemas),handleUpdateOrganization)