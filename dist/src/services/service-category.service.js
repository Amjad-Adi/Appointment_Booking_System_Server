"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceCategories = getServiceCategories;
exports.getNumberOfServiceCategories = getNumberOfServiceCategories;
exports.getServiceCategory = getServiceCategory;
exports.createServiceCategory = createServiceCategory;
exports.updateServiceCategory = updateServiceCategory;
exports.getCategoryIds = getCategoryIds;
const service_category_repository_js_1 = require("../repositories/service-category.repository.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const conflict_error_js_1 = require("../errors/conflict.error.js");
async function getServiceCategories(query) {
    return await (0, service_category_repository_js_1.findAll)(query);
}
async function getNumberOfServiceCategories(query) {
    return await (0, service_category_repository_js_1.countAll)(query);
}
async function getServiceCategory(uuid) {
    const result = await (0, service_category_repository_js_1.findByUuid)(uuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("ServiceCategory");
    }
    return result;
}
async function createServiceCategory(category) {
    if (await (0, service_category_repository_js_1.isNameFound)(category.name)) {
        throw new conflict_error_js_1.ConflictError();
    }
    const result = await (0, service_category_repository_js_1.create)(category);
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError();
    }
    return result;
}
async function updateServiceCategory(category) {
    const result = await (0, service_category_repository_js_1.update)(category);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("ServiceCategory");
    }
    return result;
}
async function getCategoryIds(serviceCategoryUuids) {
    const categoryIds = await (0, service_category_repository_js_1.findCategoryIds)(serviceCategoryUuids);
    if (categoryIds.length !== serviceCategoryUuids.length) {
        throw new not_found_error_js_1.NotFoundError("Service Categories");
    }
    return categoryIds;
}
