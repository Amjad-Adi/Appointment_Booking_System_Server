"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkingHours = getWorkingHours;
exports.getNumberOfWorkingHours = getNumberOfWorkingHours;
exports.getWorkingHour = getWorkingHour;
exports.updateWorkingHours = updateWorkingHours;
exports.updateOrganizationWorkingHours = updateOrganizationWorkingHours;
exports.createWorkingDaysService = createWorkingDaysService;
exports.findTodayWorkingHoursService = findTodayWorkingHoursService;
const working_hours_repository_js_1 = require("../repositories/working-hours.repository.js");
const organizaiton_repository_js_1 = require("../repositories/organizaiton.repository.js");
const user_service_js_1 = require("./user.service.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const day_of_week_js_1 = require("../models/enums/day-of-week.js");
async function getWorkingHours(query) {
    return await (0, working_hours_repository_js_1.findAll)(query);
}
async function getNumberOfWorkingHours(query) {
    return await (0, working_hours_repository_js_1.countAll)(query);
}
async function getWorkingHour(workingHoursUuid, organizationUuid) {
    const result = await (0, working_hours_repository_js_1.findByUuid)(organizationUuid, workingHoursUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Working Hours");
    }
    return result;
}
async function updateWorkingHours(workingHours) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(workingHours.userUuid, workingHours.organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(workingHours.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const result = await (0, working_hours_repository_js_1.update)(organizationId, workingHours);
    if (result === null) {
        throw new not_found_error_js_1.NotFoundError("Working Hours");
    }
    return result;
}
async function updateOrganizationWorkingHours(workingHours) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(workingHours.userUuid, workingHours.organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(workingHours.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    return await (0, working_hours_repository_js_1.updateWeek)(organizationId, workingHours.days);
}
async function createWorkingDaysService(organizationId) {
    const workingHoursForDays = Object.values(day_of_week_js_1.DayOfWeek).map((day) => ({ dayOfWeek: day, organizationId, }));
    await (0, working_hours_repository_js_1.createWorkingDays)(workingHoursForDays);
}
async function findTodayWorkingHoursService(organizationUuid, day) {
    const result = await (0, working_hours_repository_js_1.findTodayWorkingHours)(organizationUuid, day);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Working Hours");
    }
    return result;
}
