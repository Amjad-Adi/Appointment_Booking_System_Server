import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {createServiceSchema, updateServiceSchema} from "../middlewares/schemas/service.schema";
import {handleGetOrganizationService, handleUpdateOrganizationService, handleCreateOrganizationService, handleGetOrganizationServices} from "../controllers/service.controller";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import {authorize,rejectWorkingUsers,authorizeOrganizationUser} from "../middlewares/authoraization/autoraization";
import {
    CREATE_ORGANIZATION_INVITATIONS,
    CREATE_SERVICE,
    READ_ORGANIZATION_INVITATIONS, UPDATE_ORGANIZATION_INVITATIONS,
    UPDATE_SERVICE
} from "../permissions/permissions";
import { validateUuid } from "../middlewares/schemas/parameters.schema";
export let sendInvitationRouter=express.Router({mergeParams:true});
sendInvitationRouter.route("/")
    .get(authenticateToken,authorizeOrganizationUser,authorize(READ_ORGANIZATION_INVITATIONS),handleCreateOrganizationService)
    .post(authenticateToken,authorizeOrganizationUser,authorize(CREATE_ORGANIZATION_INVITATIONS),validateBody(createServiceSchema),handleCreateOrganizationService)

sendInvitationRouter.route("/:invitationUuid")
    .get(authenticateToken,authorizeOrganizationUser,authorize(READ_ORGANIZATION_INVITATIONS),validateParameter(validateUuid,"invitationUuid"),handleGetOrganizationService)
    .patch(authenticateToken,authorizeOrganizationUser,authorize(UPDATE_ORGANIZATION_INVITATIONS),validateParameter(validateUuid,"invitationUuid"),validateBody(updateServiceSchema),handleUpdateOrganizationService)