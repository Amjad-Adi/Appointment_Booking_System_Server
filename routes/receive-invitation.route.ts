import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema";
import {updateInvitationSchema} from "../middlewares/zod-schemas/invitations.schema";
import {handleReceiveOrganizationInvitation} from "../controllers/invitation.controller";
import {invitationLogin} from "../controllers/authentication/authentication-management.controller";

export const receiveInvitationRouter=express.Router({mergeParams:true});
receiveInvitationRouter.route("/:invitationUuid")
    .get(validateParameter(validateUuid,"invitationUuid"),invitationLogin,handleReceiveOrganizationInvitation)