import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {handleCreateOrganizationInvitation, handleGetOrganizationInvitation, handleGetOrganizationInvitations} from "../controllers/sent-invitation.controller";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import {
    CREATE_ORGANIZATION_INVITATIONS,
    CREATE_SERVICE,
    READ_ORGANIZATION_INVITATIONS,
    UPDATE_SERVICE
} from "../permissions/permissions";
import { validateUuid } from "../middlewares/schemas/parameters.schema";
import {authorize} from "../middlewares/authorization/authorization";
import {createInvitationSchema} from "../middlewares/schemas/invitations.schema";

export let sendInvitationRouter=express.Router({mergeParams:true});
sendInvitationRouter.route("/")
    .get(authenticateToken,authorize(READ_ORGANIZATION_INVITATIONS),handleGetOrganizationInvitations)
    .post(authenticateToken,authorize(CREATE_ORGANIZATION_INVITATIONS),validateBody(createInvitationSchema),handleCreateOrganizationInvitation)

sendInvitationRouter.route("/:invitationUuid")
    .get(authenticateToken,authorize(READ_ORGANIZATION_INVITATIONS),validateParameter(validateUuid,"invitationUuid"),handleGetOrganizationInvitation)