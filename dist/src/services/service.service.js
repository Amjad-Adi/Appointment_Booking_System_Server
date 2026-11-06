"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServices = getServices;
exports.getNumberOfServices = getNumberOfServices;
exports.getService = getService;
exports.getServiceIdByUuid = getServiceIdByUuid;
exports.createService = createService;
exports.updateService = updateService;
const service_repository_js_1 = require("../repositories/service.repository.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const conflict_error_js_1 = require("../errors/conflict.error.js");
const organizaiton_repository_js_1 = require("../repositories/organizaiton.repository.js");
const user_service_js_1 = require("./user.service.js");
async function getServices(query) {
    return (await (0, service_repository_js_1.findAll)(query));
}
async function getNumberOfServices(query) {
    return (await (0, service_repository_js_1.countAll)(query));
}
async function getService(serviceUuid, organizationUuid) {
    const result = await (0, service_repository_js_1.findByUuid)(serviceUuid, organizationUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Service");
    }
    return result;
}
async function getServiceIdByUuid(serviceUuid, organizationUuid) {
    const result = await (0, service_repository_js_1.findIdByUuid)(serviceUuid, organizationUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Service");
    }
    return result;
}
async function createService(service, userUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, service.organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(service.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    service.organizationId = organizationId;
    if (await (0, service_repository_js_1.isNameFound)(service.organizationUuid, service.name)) {
        throw new conflict_error_js_1.ConflictError();
    }
    const result = await (0, service_repository_js_1.create)(service);
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError();
    }
    return result;
}
async function updateService(service) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(service.userUuid, service.organizationUuid);
    const result = await (0, service_repository_js_1.update)(service);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Service");
    }
    return result;
}
