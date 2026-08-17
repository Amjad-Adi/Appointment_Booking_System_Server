import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import { handleUpdateOrganizationInvitation} from "../controllers/sent-invitation.controller";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import { validateUuid } from "../middlewares/schemas/parameters.schema";
import {updateInvitationSchema} from "../middlewares/schemas/invitations.schema";

export let receiveInvitationRouter=express.Router({mergeParams:true});
receiveInvitationRouter.route("/:invitationUuid")
    .patch(authenticateToken,validateParameter(validateUuid,"invitationUuid"),validateBody(updateInvitationSchema),handleUpdateOrganizationInvitation)