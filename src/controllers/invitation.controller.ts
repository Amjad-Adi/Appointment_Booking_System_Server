import type {
    Request,
    Response,
} from "express";

import {
    getInvitations,
    getNumberOfInvitations,
    createInvitation,
    updateInvitation,
    getPublicInvitationByToken,
    acceptInvitation, getInvitation,
} from "../services/invitation.service.js";

import { getOrganization } from "../services/organization.service.js";


import { QueryResponse } from "../models/query.model.js";

import type {
    QueryInvitation,
} from "../models/invitation.model.js";
import { sendInvitationEmail } from '../services/smtp-nodemailer.service';

export async function handleGetOrganizationInvitations(
    req: Request,
    res: Response,
) {
    const query =
        req.validatedQuery as unknown as QueryInvitation;

    query.offset =
        (query.page - 1) *
        query.limit;

    const organizationUuid =
        req.params.organizationUuid as string;

    query.filter = {
        ...query.filter,
        organizationUuid,
    };

    const userUuid =
        req.user?.uuid as string;

    const [
        invitations,
        totalInvitations,
    ] = await Promise.all([
        getInvitations(
            query,
            userUuid,
        ),

        getNumberOfInvitations(
            query,
        ),
    ]);

    const baseUrl =
        req.originalUrl?.split("?")[0];

    const responseResult =
        new QueryResponse(
            invitations,
            totalInvitations,
            baseUrl,
            query.page,
            query.limit,
        );

    return res
        .status(200)
        .json(responseResult);
}
export async function handleGetOrganizationInvitation(
    req: Request,
    res: Response,
) {
    const organizationUuid =
        req.params.organizationUuid as string;

    const invitationUuid =
        req.params.invitationUuid as string;

    const userUuid =
        req.user?.uuid as string;

    const result =
        await getInvitation(
            organizationUuid,
            invitationUuid,
            userUuid,
        );

    return res
        .status(200)
        .json(result);
}

export async function handleCreateOrganizationInvitation(
    req: Request,
    res: Response,
) {
    const invitationData =
        req.body;

    const currentUserUuid =
        req.user?.uuid as string;
    const organizationUuid =
        req.params.organizationUuid as string;

    const organization =
        await getOrganization(
            organizationUuid,
        );

    const {
        invitation,
        rawToken,
    } = await createInvitation(
        invitationData,
        organizationUuid,
        currentUserUuid,
    );
    await sendInvitationEmail(
        organization.name,
        invitationData.email,
        rawToken,
    );

    return res
        .status(201)
        .json(invitation);
}

export async function handleUpdateOrganizationInvitation(
    req: Request,
    res: Response,
) {
    const invitationData = {
        ...req.body,

        uuid:
        req.params.invitationUuid,

        organizationUuid:
        req.params.organizationUuid,

        userUuid:
            req.user?.uuid as string,
    };

    const result =
        await updateInvitation(
            invitationData,
        );

    return res
        .status(200)
        .json(result);
}

export async function handleGetPublicInvitation(
    req: Request,
    res: Response,
) {
    const token =
        req.params.token as string;

    const invitation =
        await getPublicInvitationByToken(
            token,
        );

    return res
        .status(200)
        .json(invitation);
}

export async function handleAcceptInvitation(
    req: Request,
    res: Response,
) {
    const token =
        req.params.token as string;

    const acceptedData =
        await acceptInvitation(
            token,
        );

    return res
        .status(200)
        .json({
            message:
                "Invitation accepted",

            data:
            acceptedData,
        });
}