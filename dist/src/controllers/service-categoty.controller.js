"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetServiceCategories = handleGetServiceCategories;
exports.handleGetServiceCategory = handleGetServiceCategory;
exports.handleCreateServiceCategory = handleCreateServiceCategory;
exports.handleUpdateServiceCategory = handleUpdateServiceCategory;
const service_category_service_js_1 = require("../services/service-category.service.js");
const query_model_js_1 = require("../models/query.model.js");
async function handleGetServiceCategories(req, res) {
    const query = req.validatedQuery;
    const [categories, totalCategories] = await Promise.all([
        (0, service_category_service_js_1.getServiceCategories)(query),
        (0, service_category_service_js_1.getNumberOfServiceCategories)(query),
    ]);
    query.offset = (query.page - 1) * query.limit;
    const baseUrl = req.originalUrl.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(categories, totalCategories, baseUrl, query.page, query.limit);
    return res.status(200).json(responseResult);
}
async function handleGetServiceCategory(req, res) {
    const categoryUuid = req.params.categoryUuid;
    const result = await (0, service_category_service_js_1.getServiceCategory)(categoryUuid);
    return res.status(200).json(result);
}
async function handleCreateServiceCategory(req, res) {
    const category = req.body;
    const result = await (0, service_category_service_js_1.createServiceCategory)(category);
    return res.status(201).json(result);
}
async function handleUpdateServiceCategory(req, res) {
    const category = req.body;
    category.uuid = req.params.categoryUuid;
    const result = await (0, service_category_service_js_1.updateServiceCategory)(category);
    return res.status(200).json(result);
}
