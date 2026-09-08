import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton.js";
import {createServiceSchema, updateServiceSchema} from "../middlewares/zod-schemas/service.schema.js";
import {handleCreateOrganizationInvitation, handleGetOrganizationInvitation, handleGetOrganizationInvitations, handleReceiveOrganizationInvitation} from "../controllers/invitation.controller.js";
import {
    CREATE_ORGANIZATION_INVITATIONS,
    CREATE_SERVICE,
    READ_ORGANIZATION_INVITATIONS, UPDATE_ORGANIZATION_INVITATIONS,
    UPDATE_SERVICE
} from "../permissions/permissions.js";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema.js";
import {authorize} from "../middlewares/authorization/authorization.js";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller.js";
export const sendInvitationRouter=express.Router({mergeParams:true});
sendInvitationRouter.route("/")
    .get(authenticateToken,authorize(READ_ORGANIZATION_INVITATIONS),handleGetOrganizationInvitations)
    .post(authenticateToken,authorize(CREATE_ORGANIZATION_INVITATIONS),validateBody(createServiceSchema),handleCreateOrganizationInvitation)

sendInvitationRouter.route("/:invitationUuid")
    .get(authenticateToken,authorize(READ_ORGANIZATION_INVITATIONS),validateParameter(validateUuid,"invitationUuid"),handleGetOrganizationInvitation)
    .patch(authenticateToken,authorize(UPDATE_ORGANIZATION_INVITATIONS),validateParameter(validateUuid,"invitationUuid"),validateBody(updateServiceSchema),handleReceiveOrganizationInvitation)