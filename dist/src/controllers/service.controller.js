"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetServices = handleGetServices;
exports.handleGetService = handleGetService;
exports.handleCreateOrganizationService = handleCreateOrganizationService;
exports.handleUpdateOrganizationService = handleUpdateOrganizationService;
const service_service_js_1 = require("../services/service.service.js");
const query_model_js_1 = require("../models/query.model.js");
async function handleGetServices(req, res) {
    const query = req.validatedQuery;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid;
    console.log(query);
    if (organizationUuid !== null) {
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }
    const [services, totalServices] = await Promise.all([
        (0, service_service_js_1.getServices)(query),
        (0, service_service_js_1.getNumberOfServices)(query),
    ]);
    const baseUrl = req.originalUrl.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(services, totalServices, baseUrl, query.page, query.limit);
    return res.status(200).json(responseResult);
}
async function handleGetService(req, res) {
    const serviceUuid = req.params.serviceUuid;
    const organizationUuid = req.user?.organizationUuid;
    const result = await (0, service_service_js_1.getService)(serviceUuid, organizationUuid);
    return res.status(200).json(result);
}
async function handleCreateOrganizationService(req, res) {
    const service = req.body;
    service.organizationUuid = req.params.organizationUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, service_service_js_1.createService)(service, userUuid);
    return res.status(201).json(result);
}
async function handleUpdateOrganizationService(req, res) {
    const service = req.body;
    service.uuid = req.params.serviceUuid;
    service.userUuid = req.user?.uuid;
    service.organizationUuid = req.params.organizationUuid;
    const result = await (0, service_service_js_1.updateService)(service);
    return res.status(200).json(result);
}
