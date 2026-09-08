import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton.js";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller.js";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema.js";
import {updateInvitationSchema} from "../middlewares/zod-schemas/invitations.schema.js";
import {handleReceiveOrganizationInvitation} from "../controllers/invitation.controller.js";
import {invitationLogin} from "../controllers/authentication/authentication-management.controller.js";

export const receiveInvitationRouter=express.Router({mergeParams:true});
receiveInvitationRouter.route("/:invitationUuid")
    .get(validateParameter(validateUuid,"invitationUuid"),invitationLogin,handleReceiveOrganizationInvitation)