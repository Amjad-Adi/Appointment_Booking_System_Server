"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrganizationInvitations = handleGetOrganizationInvitations;
exports.handleGetOrganizationInvitation = handleGetOrganizationInvitation;
exports.handleCreateOrganizationInvitation = handleCreateOrganizationInvitation;
exports.handleUpdateOrganizationInvitation = handleUpdateOrganizationInvitation;
exports.handleGetPublicInvitation = handleGetPublicInvitation;
exports.handleAcceptInvitation = handleAcceptInvitation;
const invitation_service_js_1 = require("../services/invitation.service.js");
const organization_service_js_1 = require("../services/organization.service.js");
const query_model_js_1 = require("../models/query.model.js");
const smtp_nodemailer_service_1 = require("../services/smtp-nodemailer.service");
async function handleGetOrganizationInvitations(req, res) {
    const query = req.validatedQuery;
    query.offset =
        (query.page - 1) *
            query.limit;
    const organizationUuid = req.params.organizationUuid;
    query.filter = {
        ...query.filter,
        organizationUuid,
    };
    const userUuid = req.user?.uuid;
    const [invitations, totalInvitations,] = await Promise.all([
        (0, invitation_service_js_1.getInvitations)(query, userUuid),
        (0, invitation_service_js_1.getNumberOfInvitations)(query),
    ]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(invitations, totalInvitations, baseUrl, query.page, query.limit);
    return res
        .status(200)
        .json(responseResult);
}
async function handleGetOrganizationInvitation(req, res) {
    const organizationUuid = req.params.organizationUuid;
    const invitationUuid = req.params.invitationUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, invitation_service_js_1.getInvitation)(organizationUuid, invitationUuid, userUuid);
    return res
        .status(200)
        .json(result);
}
async function handleCreateOrganizationInvitation(req, res) {
    const invitationData = req.body;
    const currentUserUuid = req.user?.uuid;
    const organizationUuid = req.params.organizationUuid;
    const organization = await (0, organization_service_js_1.getOrganization)(organizationUuid);
    const { invitation, rawToken, } = await (0, invitation_service_js_1.createInvitation)(invitationData, organizationUuid, currentUserUuid);
    await (0, smtp_nodemailer_service_1.sendInvitationEmail)(organization.name, invitationData.email, rawToken);
    return res
        .status(201)
        .json(invitation);
}
async function handleUpdateOrganizationInvitation(req, res) {
    const invitationData = {
        ...req.body,
        uuid: req.params.invitationUuid,
        organizationUuid: req.params.organizationUuid,
        userUuid: req.user?.uuid,
    };
    const result = await (0, invitation_service_js_1.updateInvitation)(invitationData);
    return res
        .status(200)
        .json(result);
}
async function handleGetPublicInvitation(req, res) {
    const token = req.params.token;
    const invitation = await (0, invitation_service_js_1.getPublicInvitationByToken)(token);
    return res
        .status(200)
        .json(invitation);
}
async function handleAcceptInvitation(req, res) {
    const token = req.params.token;
    const acceptedData = await (0, invitation_service_js_1.acceptInvitation)(token);
    return res
        .status(200)
        .json({
        message: "Invitation accepted",
        data: acceptedData,
    });
}
