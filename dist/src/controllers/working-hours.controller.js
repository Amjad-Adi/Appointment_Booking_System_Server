"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrganizationWorkingHours = handleGetOrganizationWorkingHours;
exports.handleGetOrganizationWorkingHour = handleGetOrganizationWorkingHour;
exports.handleUpdateOrganizationWorkingHours = handleUpdateOrganizationWorkingHours;
exports.handleUpdateOrganizationWorkingHoursWeek = handleUpdateOrganizationWorkingHoursWeek;
const working_hours_services_1 = require("../services/working-hours.services");
const query_model_js_1 = require("../models/query.model.js");
async function handleGetOrganizationWorkingHours(req, res) {
    const routeOrganizationUuid = req.params.organizationUuid;
    const query = req.validatedQuery;
    query.filter = {
        ...query.filter,
        organizationUuid: routeOrganizationUuid,
    };
    query.offset = (query.page - 1) * query.limit;
    const [workingHours, totalNumberOfWorkingHours,] = await Promise.all([(0, working_hours_services_1.getWorkingHours)(query), (0, working_hours_services_1.getNumberOfWorkingHours)(query)]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(workingHours, totalNumberOfWorkingHours, baseUrl, query.page, query.limit);
    return res.status(200).json(responseResult);
}
async function handleGetOrganizationWorkingHour(req, res) {
    const workingHoursUuid = req.params.workingHoursUuid;
    const organizationUuid = req.params.organizationUuid;
    const result = await (0, working_hours_services_1.getWorkingHour)(workingHoursUuid, organizationUuid);
    return res.status(200).json(result);
}
async function handleUpdateOrganizationWorkingHours(req, res) {
    const workingHours = req.body;
    workingHours.uuid = req.params.workingHoursUuid;
    workingHours.organizationUuid = req.params.organizationUuid;
    workingHours.userUuid = req.user?.uuid;
    const result = await (0, working_hours_services_1.updateWorkingHours)(workingHours);
    return res.status(200).json(result);
}
async function handleUpdateOrganizationWorkingHoursWeek(req, res) {
    const organizationUuid = req.params.organizationUuid;
    const userUuid = req.user?.uuid;
    const body = req.body;
    const workingHours = {
        organizationUuid,
        userUuid,
        days: body.days,
    };
    const result = await (0, working_hours_services_1.updateOrganizationWorkingHours)(workingHours);
    return res.status(200).json(result);
}
