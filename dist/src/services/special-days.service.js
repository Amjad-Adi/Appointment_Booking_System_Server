"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialDays = getSpecialDays;
exports.getNumberOfSpecialDays = getNumberOfSpecialDays;
exports.getSpecialDay = getSpecialDay;
exports.createSpecialDay = createSpecialDay;
exports.updateSpecialDay = updateSpecialDay;
exports.isTodaySpecialDay = isTodaySpecialDay;
const special_days_repository_js_1 = require("../repositories/special-days.repository.js");
const user_service_js_1 = require("./user.service.js");
const organizaiton_repository_js_1 = require("../repositories/organizaiton.repository.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
async function getSpecialDays(query) {
    const organizationUuid = query.filter?.organizationUuid;
    if (organizationUuid === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    query.organizationId =
        organizationId;
    return await (0, special_days_repository_js_1.findAll)(query);
}
async function getNumberOfSpecialDays(query) {
    const organizationUuid = query.filter?.organizationUuid;
    if (organizationUuid === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    query.organizationId =
        organizationId;
    return await (0, special_days_repository_js_1.countAll)(query);
}
async function getSpecialDay(specialDayUuid, organizationUuid, userUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const result = await (0, special_days_repository_js_1.findByUuid)(organizationId, specialDayUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Special Day");
    }
    return result;
}
async function createSpecialDay(specialDay) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(specialDay.userUuid, specialDay.organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(specialDay.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const userId = await (0, user_service_js_1.getUserIdByUuid)(specialDay.userUuid);
    if (userId === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    /*
     * Only one special-day record should exist for an
     * organization on a particular calendar date.
     */
    const existingSpecialDay = await (0, special_days_repository_js_1.findByDate)(organizationId, specialDay.dayDate);
    if (existingSpecialDay !== undefined) {
        throw new bad_request_error_js_1.BadRequestError("A special day already exists for this date.");
    }
    const result = await (0, special_days_repository_js_1.create)({
        ...specialDay,
        organizationId,
        userUuid: specialDay.userUuid,
    });
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError();
    }
    return result;
}
async function updateSpecialDay(specialDay) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(specialDay.userUuid, specialDay.organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(specialDay.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    /*
     * If the date changes, don't allow the new date to
     * collide with another special-day record.
     */
    if (specialDay.dayDate !== undefined) {
        const existingSpecialDay = await (0, special_days_repository_js_1.findByDate)(organizationId, specialDay.dayDate);
        if (existingSpecialDay !== undefined &&
            existingSpecialDay.uuid !== specialDay.uuid) {
            throw new bad_request_error_js_1.BadRequestError("A special day already exists for this date.");
        }
    }
    const result = await (0, special_days_repository_js_1.update)(specialDay, organizationId);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Special Day");
    }
    return result;
}
async function isTodaySpecialDay(organizationUuid, userUuid, organizationTimeZone) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const today = getDateInTimeZone(new Date(), organizationTimeZone);
    return await (0, special_days_repository_js_1.findByDate)(organizationId, today);
}
function getDateInTimeZone(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;
    if (year === undefined ||
        month === undefined ||
        day === undefined) {
        throw new bad_request_error_js_1.BadRequestError("Unable to determine organization date.");
    }
    return `${year}-${month}-${day}`;
}
