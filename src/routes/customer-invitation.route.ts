import express, { type NextFunction, type Request, type Response } from 'express';

import {
    handleCancelOrganizationCustomerInvitation,
    handleCreateOrganizationCustomerInvitation,
    handleGetMyCustomerInvitations,
    handleGetOrganizationCustomerInvitations,
    handleRespondToCustomerInvitation,
} from '../controllers/customer-invitation.controller';

import {
    createCustomerInvitationSchema,
    queryCustomerInvitationSchema,
    respondCustomerInvitationSchema,
    updateCustomerInvitationSchema,
} from '../middlewares/zod-schemas/customer-invitation.schema';

import { validateBody, validateParameter, validateQuery } from '../middlewares/validaiton';
import { validateUuid } from '../middlewares/zod-schemas/parameters.schema';
import { authenticateToken } from '../controllers/authentication/jwt.authentication.controller';
import { authorize } from '../middlewares/authorization/authorization';
import { rolesPermissions } from '../permissions/roles-permissions';
import { ForbiddenError } from '../errors/forbidden.error';

import {
    ACCEPT_ORGANIZATION_INVITATION,
    CREATE_CUSTOMER_INVITATIONS,
    READ_CUSTOMER_INVITATIONS,
    REJECT_ORGANIZATION_INVITATION,
    UPDATE_CUSTOMER_INVITATIONS,
    VIEW_OWN_INVITATIONS,
} from '../permissions/permissions';

import { CustomerInvitationStatus } from '../models/enums/customer-invitation-status';
import { RespondCustomerInvitation } from '../models/customer-invitation.model';

function authorizeInvitationResponse(req: Request, _res: Response, next: NextFunction) {
    const role = req.user?.role;
    const { status } = req.body as RespondCustomerInvitation;
    const permission =
        status === CustomerInvitationStatus.ACCEPTED
            ? ACCEPT_ORGANIZATION_INVITATION
            : REJECT_ORGANIZATION_INVITATION;

    if (!role || !rolesPermissions[role].has(permission)) {
        throw new ForbiddenError();
    }

    next();
}

export const organizationCustomerInvitationsRouter = express.Router({ mergeParams: true });

organizationCustomerInvitationsRouter
    .route('/')
    .get(
        authenticateToken,
        authorize(READ_CUSTOMER_INVITATIONS),
        validateQuery(queryCustomerInvitationSchema),
        handleGetOrganizationCustomerInvitations,
    )
    .post(
        authenticateToken,
        authorize(CREATE_CUSTOMER_INVITATIONS),
        validateBody(createCustomerInvitationSchema),
        handleCreateOrganizationCustomerInvitation,
    );

organizationCustomerInvitationsRouter
    .route('/:invitationUuid')
    .patch(
        authenticateToken,
        authorize(UPDATE_CUSTOMER_INVITATIONS),
        validateParameter(validateUuid, 'invitationUuid'),
        validateBody(updateCustomerInvitationSchema),
        handleCancelOrganizationCustomerInvitation,
    );

export const customerInvitationsRouter = express.Router();

customerInvitationsRouter
    .route('/me')
    .get(
        authenticateToken,
        authorize(VIEW_OWN_INVITATIONS),
        validateQuery(queryCustomerInvitationSchema),
        handleGetMyCustomerInvitations,
    );

customerInvitationsRouter
    .route('/:invitationUuid')
    .patch(
        authenticateToken,
        authorize(VIEW_OWN_INVITATIONS),
        validateParameter(validateUuid, 'invitationUuid'),
        validateBody(respondCustomerInvitationSchema),
        authorizeInvitationResponse,
        handleRespondToCustomerInvitation,
    );
