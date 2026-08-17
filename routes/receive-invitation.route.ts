import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {
    handleReceiveOrganizationInvitation,
} from "../controllers/invitation.controller";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import { validateUuid } from "../middlewares/schemas/parameters.schema";
import {updateInvitationSchema} from "../middlewares/schemas/invitations.schema";
import {invitationLogin} from "../controllers/authentication/authentication-management.controller";

export let receiveInvitationRouter=express.Router({mergeParams:true});
receiveInvitationRouter.route("/:invitationUuid")
    .get(validateParameter(validateUuid,"invitationUuid"),invitationLogin,handleReceiveOrganizationInvitation)