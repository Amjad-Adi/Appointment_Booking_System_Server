"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrganizations = handleGetOrganizations;
exports.handleGetOrganization = handleGetOrganization;
exports.handleCreateOrganization = handleCreateOrganization;
exports.handleUpdateOrganization = handleUpdateOrganization;
exports.handleUpdateOrganizationByAdmin = handleUpdateOrganizationByAdmin;
const organization_service_js_1 = require("../services/organization.service.js");
const query_model_1 = require("../models/query.model");
const roles_1 = require("../models/enums/roles");
async function handleGetOrganizations(req, res) {
    const query = req.validatedQuery;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid;
    if (organizationUuid !== null) {
        return (0, organization_service_js_1.getOrganization)(organizationUuid);
    }
    const [organizations, totalOrganizations] = await Promise.all([(0, organization_service_js_1.getOrganizations)(query), (0, organization_service_js_1.getNumberOfOrganizations)(query),]);
    const baseUrl = req.originalUrl?.split('?')[0];
    const responseResult = new query_model_1.QueryResponse(organizations, totalOrganizations, baseUrl, query.page, query.limit);
    return res.status(200).json(responseResult);
}
async function handleGetOrganization(req, res) {
    const uuid = (req.params.organizationUuid);
    const organizationUuid = req.user?.organizationUuid;
    let result;
    if (organizationUuid !== null) {
        result = await (0, organization_service_js_1.getOrganization)(organizationUuid);
    }
    else {
        result = await (0, organization_service_js_1.getOrganization)(uuid);
    }
    return res.status(200).json(result);
}
async function handleCreateOrganization(req, res) {
    let result;
    if (req.user?.role === roles_1.Role.SUPER_ADMIN) {
        const organization = req.body;
        result = await (0, organization_service_js_1.createOrganizationByAdmin)(organization);
    }
    else {
        const organization = {
            ...req.body,
            organizationOwnerUuid: req.user?.uuid,
        };
        result = await (0, organization_service_js_1.createOrganization)(organization);
    }
    return res.status(201).json(result);
}
async function handleUpdateOrganization(req, res) {
    const organization = (req.body);
    organization.uuid = req.params.organizationUuid;
    let result;
    if (req.user?.role == roles_1.Role.SUPER_ADMIN)
        result = await (0, organization_service_js_1.updateOrganizationByAdmin)(organization);
    else
        result = await (0, organization_service_js_1.updateOrganization)(organization);
    return res.status(200).json(result);
}
async function handleUpdateOrganizationByAdmin(req, res) {
    const organization = (req.body);
    organization.uuid = (req.params.organizationUuid);
    const result = await (0, organization_service_js_1.updateOrganizationByAdmin)(organization);
    return res.status(200).json(result);
}
