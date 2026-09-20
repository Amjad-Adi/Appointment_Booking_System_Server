import crypto from "crypto";

import {
    findAll,
    countAll,
    create,
    update,
    findPendingByEmailAndOrg,
    findByTokenHash,
    markAccepted, findByUuid,
} from "../repositories/invitation.repository.js";

import { findByEmail } from "../repositories/user.repository.js";

import { NotFoundError } from "../errors/not-found.error.js";
import { ConflictError } from "../errors/conflict.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";

import {
    AuthorizeOrganizationUser,
    getUserIdByUuid,
} from "./user.service.js";

import { getOrganizationIdByUuid } from "./organization.service.js";

import { InvitationStatus } from "../models/enums/invitation-status.js";

import type {
    CreateInvitation, InvitationResponse,
    QueryInvitation,
    UpdateInvitation,
} from "../models/invitation.model.js";

import {
    generateHashToken,
    generateRawToken,
} from "../utils/hash.js";

function generateSecureToken() {
    const rawToken = generateRawToken();
    const tokenHash = generateHashToken(rawToken);

    return {
        rawToken,
        tokenHash,
    };
}

export async function getInvitations(
    query: QueryInvitation,
    userUuid: string,
) {
    if (query.filter?.organizationUuid) {
        await AuthorizeOrganizationUser(
            userUuid,
            query.filter.organizationUuid,
        );
    }

    return await findAll(query);
}

export async function getNumberOfInvitations(
    query: QueryInvitation,
) {
    return await countAll(query);
}
export async function getInvitation(
    organizationUuid: string,
    invitationUuid: string,
    userUuid: string,
): Promise<InvitationResponse> {
    await AuthorizeOrganizationUser(
        userUuid,
        organizationUuid,
    );

    const result =
        await findByUuid(
            organizationUuid,
            invitationUuid,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Invitation",
        );
    }

    return result;
}
export async function createInvitation(
    invitationData: CreateInvitation,
    organizationUuid: string,
    userUuid: string,
) {
    await AuthorizeOrganizationUser(
        userUuid,
        organizationUuid,
    );

    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    const existingUser =
        await findByEmail(
            invitationData.email,
        );

    if (existingUser) {
        throw new ConflictError(
            "User with this email already exists.",
        );
    }

    const hasPending =
        await findPendingByEmailAndOrg(
            organizationId,
            invitationData.email,
        );

    if (hasPending) {
        throw new ConflictError(
            "An active invitation already exists for this email.",
        );
    }

    const senderId =
        await getUserIdByUuid(
            userUuid,
        );

    const {
        rawToken,
        tokenHash,
    } = generateSecureToken();

    const expiresAtUTC =
        new Date(
            invitationData.expiresAtUTC,
        );

    if (
        Number.isNaN(
            expiresAtUTC.getTime(),
        )
    ) {
        throw new BadRequestError(
            "Invalid invitation expiration date.",
        );
    }

    if (
        expiresAtUTC.getTime() <=
        Date.now()
    ) {
        throw new BadRequestError(
            "Invitation expiration must be in the future.",
        );
    }

    invitationData.organizationId =
        organizationId;

    invitationData.senderId =
        senderId;

    invitationData.tokenHash =
        tokenHash;

    const invitation =
        await create(
            invitationData,
        );
    console.log("Invitation: ", invitation);
    if (!invitation) {
        throw new BadRequestError();
    }

    return {
        invitation,
        rawToken,
    };
}
export async function updateInvitation(
    invitation: UpdateInvitation
) {
    await AuthorizeOrganizationUser(invitation.userUuid, invitation.organizationUuid);

    const existing = await findByUuid(
        invitation.uuid,
        invitation.organizationUuid,
    );    if (!existing) {
        throw new NotFoundError("Invitation");
    }
    if (existing.invitationStatus === InvitationStatus.ACCEPTED) {
        throw new BadRequestError("Cannot update an already accepted invitation.");
    }

    const result = await update(invitation);
    if (!result) {
        throw new NotFoundError("Invitation");
    }

    return result;
}

export async function getPublicInvitationByToken(
    rawToken: string,
) {
    const tokenHash =
        crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

    const invitation =
        await findByTokenHash(tokenHash);

    if (!invitation) {
        throw new NotFoundError(
            "Invitation",
        );
    }

    if (
        invitation.invitationStatus !==
        InvitationStatus.PENDING
    ) {
        throw new ConflictError(
            "Invitation is no longer pending.",
        );
    }

    if (
        new Date(invitation.expiresAtUTC).getTime() <=
        Date.now()
    ) {
        throw new ConflictError(
            "Invitation has expired.",
        );
    }

    const existingUser =
        await findByEmail(
            invitation.recipientEmail,
        );

    if (existingUser) {
        throw new ConflictError(
            "User with this email already exists.",
        );
    }

    return {
        uuid: invitation.uuid,
        email: invitation.recipientEmail,
        role: invitation.role,
        organization: {
            uuid: invitation.organizationUuid,
            name: invitation.organizationName,
        },
        status: invitation.invitationStatus,
        expiresAtUTC: invitation.expiresAtUTC,
    };
}

export async function acceptInvitation(
    rawToken: string,
) {
    const publicData =
        await getPublicInvitationByToken(
            rawToken,
        );

    await markAccepted(
        publicData.uuid,
    );

    return publicData;
}