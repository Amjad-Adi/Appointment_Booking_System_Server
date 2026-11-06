"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateServiceJunctionCategories = handleCreateServiceJunctionCategories;
exports.handleUpdateServiceJunctionCategories = handleUpdateServiceJunctionCategories;
const service_junction_category_service_js_1 = require("../services/service-junction-category.service.js");
async function handleCreateServiceJunctionCategories(req, res) {
    const organizationUuid = req.params.organizationUuid;
    const serviceUuid = req.params.serviceUuid;
    const userUuid = req.user?.uuid;
    const serviceCategoryUuids = req.body.serviceCategoryUuids;
    await (0, service_junction_category_service_js_1.createServiceJunctionCategories)(serviceUuid, serviceCategoryUuids, organizationUuid, userUuid);
    return res.status(201).send();
}
async function handleUpdateServiceJunctionCategories(req, res) {
    const organizationUuid = req.params.organizationUuid;
    const serviceUuid = req.params.serviceUuid;
    const userUuid = req.user?.uuid;
    const serviceCategoryUuids = req.body.serviceCategoryUuids;
    await (0, service_junction_category_service_js_1.updateServiceJunctionCategories)(serviceUuid, serviceCategoryUuids, organizationUuid, userUuid);
    return res.status(200).send();
}
