"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceJunctionCategories = createServiceJunctionCategories;
exports.updateServiceJunctionCategories = updateServiceJunctionCategories;
const service_junction_category_repository_js_1 = require("../repositories/service-junction-category.repository.js");
const user_service_js_1 = require("./user.service.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const service_service_js_1 = require("./service.service.js");
const service_category_service_1 = require("./service-category.service");
async function createServiceJunctionCategories(serviceUuid, serviceCategoryUuids, organizationUuid, userUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, organizationUuid);
    if (serviceCategoryUuids.length === 0)
        throw new not_found_error_js_1.NotFoundError("Service Categories");
    const serviceId = await (0, service_service_js_1.getServiceIdByUuid)(serviceUuid, organizationUuid);
    if (!serviceId)
        throw new not_found_error_js_1.NotFoundError("Service");
    const categoryIds = await (0, service_category_service_1.getCategoryIds)(serviceCategoryUuids);
    if (categoryIds.length !== serviceCategoryUuids.length)
        throw new not_found_error_js_1.NotFoundError("Service Categories");
    await (0, service_junction_category_repository_js_1.create)(serviceId, categoryIds);
}
async function updateServiceJunctionCategories(serviceUuid, serviceCategoryUuids, organizationUuid, userUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, organizationUuid);
    if (serviceCategoryUuids.length === 0) {
        throw new not_found_error_js_1.NotFoundError("Service Categories");
    }
    const serviceId = await (0, service_service_js_1.getServiceIdByUuid)(serviceUuid, organizationUuid);
    if (!serviceId) {
        throw new not_found_error_js_1.NotFoundError("Service");
    }
    const categoryIds = await (0, service_category_service_1.getCategoryIds)(serviceCategoryUuids);
    if (categoryIds.length !== serviceCategoryUuids.length) {
        throw new not_found_error_js_1.NotFoundError("Service Categories");
    }
    await (0, service_junction_category_repository_js_1.update)(serviceId, categoryIds);
}
