import express from "express";
import { validateBody, validateParameter, validateQuery, } from "../middlewares/validaiton";
import { createInvitationSchema, queryInvitationSchema, acceptInvitationSchema,updateInvitationByOrganizationSchema } from "../middlewares/zod-schemas/invitations.schema";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema";
import { handleAcceptUserInvitation, handleCreateOrganizationInvitation, handleGetOrganizationInvitation, handleGetOrganizationInvitations, handleUpdateOrganizationInvitation, } from "../controllers/invitation.controller";
import { CREATE_ORGANIZATION_INVITATIONS, READ_ORGANIZATION_INVITATIONS, UPDATE_ORGANIZATION_INVITATIONS, } from "../permissions/permissions";
import { authorize } from "../middlewares/authorization/authorization";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import { upload } from '../config/multer';

export const organizationInvitationsRouter = express.Router({ mergeParams: true, });

organizationInvitationsRouter.route("/")
    .get(authenticateToken, authorize(READ_ORGANIZATION_INVITATIONS), validateQuery(queryInvitationSchema), handleGetOrganizationInvitations)
    .post(authenticateToken, authorize(CREATE_ORGANIZATION_INVITATIONS), validateBody(createInvitationSchema), handleCreateOrganizationInvitation);

organizationInvitationsRouter.route("/:invitationUuid")
    .get(authenticateToken, authorize(READ_ORGANIZATION_INVITATIONS), validateParameter(validateUuid, "invitationUuid"), handleGetOrganizationInvitation)
    .patch(authenticateToken, authorize(UPDATE_ORGANIZATION_INVITATIONS), validateParameter(validateUuid, "invitationUuid"), validateBody(updateInvitationByOrganizationSchema), handleUpdateOrganizationInvitation);

export const publicInvitationsRouter = express.Router();
publicInvitationsRouter.route("/:token/accept")
    .post(upload.single("profilePicture"), validateBody(acceptInvitationSchema), handleAcceptUserInvitation);