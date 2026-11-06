"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrganizationSpecialDays = handleGetOrganizationSpecialDays;
exports.handleGetOrganizationSpecialDay = handleGetOrganizationSpecialDay;
exports.handleCreateOrganizationSpecialDay = handleCreateOrganizationSpecialDay;
exports.handleUpdateOrganizationSpecialDay = handleUpdateOrganizationSpecialDay;
exports.handleIsTodaySpecialDay = handleIsTodaySpecialDay;
const special_days_service_js_1 = require("../services/special-days.service.js");
const query_model_js_1 = require("../models/query.model.js");
async function handleGetOrganizationSpecialDays(req, res) {
    const query = req.validatedQuery;
    query.offset =
        (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid;
    if (organizationUuid != null) {
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }
    const [specialDays, totalSpecialDays,] = await Promise.all([
        (0, special_days_service_js_1.getSpecialDays)(query),
        (0, special_days_service_js_1.getNumberOfSpecialDays)(query),
    ]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(specialDays, totalSpecialDays, baseUrl, query.page, query.limit);
    return res
        .status(200)
        .json(responseResult);
}
async function handleGetOrganizationSpecialDay(req, res) {
    const specialDayUuid = req.params.specialDayUuid;
    const organizationUuid = req.params.organizationUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, special_days_service_js_1.getSpecialDay)(specialDayUuid, organizationUuid, userUuid);
    return res
        .status(200)
        .json(result);
}
async function handleCreateOrganizationSpecialDay(req, res) {
    const specialDay = req.body;
    specialDay.organizationUuid =
        req.params.organizationUuid;
    specialDay.userUuid =
        req.user?.uuid;
    const result = await (0, special_days_service_js_1.createSpecialDay)(specialDay);
    return res
        .status(201)
        .json(result);
}
async function handleUpdateOrganizationSpecialDay(req, res) {
    const specialDay = req.body;
    specialDay.uuid =
        req.params.specialDayUuid;
    specialDay.organizationUuid =
        req.params.organizationUuid;
    specialDay.userUuid =
        req.user?.uuid;
    const result = await (0, special_days_service_js_1.updateSpecialDay)(specialDay);
    return res
        .status(200)
        .json(result);
}
async function handleIsTodaySpecialDay(req, res) {
    const organizationUuid = req.params.organizationUuid;
    const userUuid = req.user?.uuid;
    const result = await (0, special_days_service_js_1.isTodaySpecialDay)(organizationUuid, userUuid);
    return res
        .status(200)
        .json(result);
}
