import type { Request, Response } from 'express';

import {
    cancelCustomerInvitation,
    createCustomerInvitation,
    getCustomerInvitations,
    getNumberOfCustomerInvitations,
    respondToCustomerInvitation,
} from '../services/customer-invitation.service';

import {
    CreateCustomerInvitation,
    QueryCustomerInvitation,
    RespondCustomerInvitation,
    UpdateCustomerInvitation,
} from '../models/customer-invitation.model';

import { QueryResponse } from '../models/query.model';
import { verifyOrganizationAccess } from '../middlewares/authorization/authorization';

export async function handleGetOrganizationCustomerInvitations(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryCustomerInvitation;
    const organizationUuid = req.params.organizationUuid as string;

    await verifyOrganizationAccess(req, organizationUuid);

    query.offset = (query.page - 1) * query.limit;
    query.organizationUuid = organizationUuid;

    const [invitations, totalNumberOfInvitations] = await Promise.all([
        getCustomerInvitations(query),
        getNumberOfCustomerInvitations(query),
    ]);

    const baseUrl = req.originalUrl.split('?')[0];
    return res
        .status(200)
        .json(new QueryResponse(invitations, totalNumberOfInvitations, baseUrl, query.page, query.limit));
}

export async function handleCreateOrganizationCustomerInvitation(req: Request, res: Response) {
    const organizationUuid = req.params.organizationUuid as string;
    await verifyOrganizationAccess(req, organizationUuid);

    const invitation: CreateCustomerInvitation = req.body;
    invitation.organizationUuid = organizationUuid;
    invitation.senderUuid = req.user?.uuid as string;

    const result = await createCustomerInvitation(invitation);
    return res.status(201).json(result);
}

export async function handleCancelOrganizationCustomerInvitation(req: Request, res: Response) {
    const organizationUuid = req.params.organizationUuid as string;
    await verifyOrganizationAccess(req, organizationUuid);

    const invitation: UpdateCustomerInvitation = req.body;
    invitation.organizationUuid = organizationUuid;
    invitation.uuid = req.params.invitationUuid as string;
    invitation.userUuid = req.user?.uuid as string;

    const result = await cancelCustomerInvitation(invitation);
    return res.status(200).json(result);
}

export async function handleGetMyCustomerInvitations(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryCustomerInvitation;
    query.offset = (query.page - 1) * query.limit;
    query.userUuid = req.user?.uuid as string;

    const [invitations, totalNumberOfInvitations] = await Promise.all([
        getCustomerInvitations(query),
        getNumberOfCustomerInvitations(query),
    ]);

    const baseUrl = req.originalUrl.split('?')[0];
    return res
        .status(200)
        .json(new QueryResponse(invitations, totalNumberOfInvitations, baseUrl, query.page, query.limit));
}

export async function handleRespondToCustomerInvitation(req: Request, res: Response) {
    const invitation: RespondCustomerInvitation = req.body;
    invitation.uuid = req.params.invitationUuid as string;
    invitation.userUuid = req.user?.uuid as string;

    await respondToCustomerInvitation(invitation);
    return res.status(200).json({ status: invitation.status });
}
