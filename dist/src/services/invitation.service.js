"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvitations = getInvitations;
exports.getNumberOfInvitations = getNumberOfInvitations;
exports.getInvitation = getInvitation;
exports.createInvitation = createInvitation;
exports.updateInvitation = updateInvitation;
exports.getPublicInvitationByToken = getPublicInvitationByToken;
exports.acceptInvitation = acceptInvitation;
const crypto_1 = __importDefault(require("crypto"));
const invitation_repository_js_1 = require("../repositories/invitation.repository.js");
const user_repository_js_1 = require("../repositories/user.repository.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const conflict_error_js_1 = require("../errors/conflict.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const user_service_js_1 = require("./user.service.js");
const organization_service_js_1 = require("./organization.service.js");
const invitation_status_js_1 = require("../models/enums/invitation-status.js");
const hash_js_1 = require("../utils/hash.js");
function generateSecureToken() {
    const rawToken = (0, hash_js_1.generateRawToken)();
    const tokenHash = (0, hash_js_1.generateHashToken)(rawToken);
    return {
        rawToken,
        tokenHash,
    };
}
async function getInvitations(query, userUuid) {
    if (query.filter?.organizationUuid) {
        await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, query.filter.organizationUuid);
    }
    return await (0, invitation_repository_js_1.findAll)(query);
}
async function getNumberOfInvitations(query) {
    return await (0, invitation_repository_js_1.countAll)(query);
}
async function getInvitation(organizationUuid, invitationUuid, userUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, organizationUuid);
    const result = await (0, invitation_repository_js_1.findByUuid)(organizationUuid, invitationUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Invitation");
    }
    return result;
}
async function createInvitation(invitationData, organizationUuid, userUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, organizationUuid);
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    const existingUser = await (0, user_repository_js_1.findByEmail)(invitationData.email);
    if (existingUser) {
        throw new conflict_error_js_1.ConflictError("User with this email already exists.");
    }
    const hasPending = await (0, invitation_repository_js_1.findPendingByEmailAndOrg)(organizationId, invitationData.email);
    if (hasPending) {
        throw new conflict_error_js_1.ConflictError("An active invitation already exists for this email.");
    }
    const senderId = await (0, user_service_js_1.getUserIdByUuid)(userUuid);
    const { rawToken, tokenHash, } = generateSecureToken();
    const expiresAtUTC = new Date(invitationData.expiresAtUTC);
    if (Number.isNaN(expiresAtUTC.getTime())) {
        throw new bad_request_error_js_1.BadRequestError("Invalid invitation expiration date.");
    }
    if (expiresAtUTC.getTime() <=
        Date.now()) {
        throw new bad_request_error_js_1.BadRequestError("Invitation expiration must be in the future.");
    }
    invitationData.organizationId =
        organizationId;
    invitationData.senderId =
        senderId;
    invitationData.tokenHash =
        tokenHash;
    const invitation = await (0, invitation_repository_js_1.create)(invitationData);
    console.log("Invitation: ", invitation);
    if (!invitation) {
        throw new bad_request_error_js_1.BadRequestError();
    }
    return {
        invitation,
        rawToken,
    };
}
async function updateInvitation(invitation) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(invitation.userUuid, invitation.organizationUuid);
    const existing = await (0, invitation_repository_js_1.findByUuid)(invitation.uuid, invitation.organizationUuid);
    if (!existing) {
        throw new not_found_error_js_1.NotFoundError("Invitation");
    }
    if (existing.invitationStatus === invitation_status_js_1.InvitationStatus.ACCEPTED) {
        throw new bad_request_error_js_1.BadRequestError("Cannot update an already accepted invitation.");
    }
    const result = await (0, invitation_repository_js_1.update)(invitation);
    if (!result) {
        throw new not_found_error_js_1.NotFoundError("Invitation");
    }
    return result;
}
async function getPublicInvitationByToken(rawToken) {
    const tokenHash = crypto_1.default
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    const invitation = await (0, invitation_repository_js_1.findByTokenHash)(tokenHash);
    if (!invitation) {
        throw new not_found_error_js_1.NotFoundError("Invitation");
    }
    if (invitation.invitationStatus !==
        invitation_status_js_1.InvitationStatus.PENDING) {
        throw new conflict_error_js_1.ConflictError("Invitation is no longer pending.");
    }
    if (new Date(invitation.expiresAtUTC).getTime() <=
        Date.now()) {
        throw new conflict_error_js_1.ConflictError("Invitation has expired.");
    }
    const existingUser = await (0, user_repository_js_1.findByEmail)(invitation.recipientEmail);
    if (existingUser) {
        throw new conflict_error_js_1.ConflictError("User with this email already exists.");
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
async function acceptInvitation(rawToken) {
    const publicData = await getPublicInvitationByToken(rawToken);
    await (0, invitation_repository_js_1.markAccepted)(publicData.uuid);
    return publicData;
}
