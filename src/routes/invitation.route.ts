import express from "express";

import {
    validateBody,
    validateParameter,
    validateQuery,
} from "../middlewares/validaiton.js";
import {
    createInvitationSchema,
    queryInvitationSchema,
    updateInvitationSchema,
} from "../middlewares/zod-schemas/invitations.schema.js";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema.js";

import {
    handleAcceptInvitation,
    handleCreateOrganizationInvitation, handleGetOrganizationInvitation,
    handleGetOrganizationInvitations,
    handleGetPublicInvitation,
    handleUpdateOrganizationInvitation,
} from "../controllers/invitation.controller.js";

import {
    CREATE_ORGANIZATION_INVITATIONS,
    READ_ORGANIZATION_INVITATIONS,
    UPDATE_ORGANIZATION_INVITATIONS,
} from "../permissions/permissions.js";
import { authorize } from "../middlewares/authorization/authorization.js";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller.js";

export const organizationInvitationsRouter = express.Router({
    mergeParams: true,
});

organizationInvitationsRouter
    .route("/")
    .get(
        authenticateToken,
        authorize(READ_ORGANIZATION_INVITATIONS),
        validateQuery(queryInvitationSchema),
        handleGetOrganizationInvitations,
    )
    .post(
        authenticateToken,
        authorize(CREATE_ORGANIZATION_INVITATIONS),
        validateBody(createInvitationSchema),
        handleCreateOrganizationInvitation,
    );

organizationInvitationsRouter
    .route("/:invitationUuid")
    .get(
        authenticateToken,
        authorize(READ_ORGANIZATION_INVITATIONS),
        validateParameter(validateUuid, "invitationUuid"),
        handleGetOrganizationInvitation,
    )
    .patch(
        authenticateToken,
        authorize(UPDATE_ORGANIZATION_INVITATIONS),
        validateParameter(validateUuid, "invitationUuid"),
        validateBody(updateInvitationSchema),
        handleUpdateOrganizationInvitation,
    );

export const publicInvitationsRouter = express.Router();

publicInvitationsRouter
    .route("/:token")
    .get(handleGetPublicInvitation);

publicInvitationsRouter
    .route("/:token/accept")
    .post(handleAcceptInvitation);