"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeBlocks = getTimeBlocks;
exports.getNumberOfTimeBlocks = getNumberOfTimeBlocks;
exports.getTimeBlock = getTimeBlock;
exports.createTimeBlock = createTimeBlock;
exports.updateTimeBlock = updateTimeBlock;
const time_block_repository_js_1 = require("../repositories/time-block.repository.js");
const organizaiton_repository_js_1 = require("../repositories/organizaiton.repository.js");
const user_service_js_1 = require("./user.service.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const organization_service_js_1 = require("./organization.service.js");
const timezone_js_1 = require("../utils/timezone.js");
function applyDateRange(query, timeZone) {
    const fromDate = query.filter?.fromDate;
    const toDate = query.filter?.toDate;
    if (fromDate === undefined ||
        toDate === undefined) {
        return query;
    }
    const startRange = (0, timezone_js_1.getUtcDateRangeForLocalDate)(fromDate, timeZone);
    const endRange = (0, timezone_js_1.getUtcDateRangeForLocalDate)(toDate, timeZone);
    return {
        ...query,
        filter: {
            ...query.filter,
            fromDate: startRange.startUTC,
            toDate: endRange.endUTC,
        },
    };
}
async function getTimeBlocks(query) {
    const organizationUuid = query.filter?.organizationUuid;
    if (organizationUuid === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const organization = await (0, organization_service_js_1.getOrganization)(organizationUuid);
    if (organization === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const queryWithDateRange = applyDateRange({
        ...query,
        organizationId,
    }, organization.location.timezone);
    return await (0, time_block_repository_js_1.findAll)(queryWithDateRange);
}
async function getNumberOfTimeBlocks(query) {
    const organizationUuid = query.filter?.organizationUuid;
    if (organizationUuid === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const organization = await (0, organization_service_js_1.getOrganization)(organizationUuid);
    if (organization === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const organizationId = await (0, organization_service_js_1.getOrganizationIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const queryWithDateRange = applyDateRange({
        ...query,
        organizationId,
    }, organization.location.timezone);
    return await (0, time_block_repository_js_1.countAll)(queryWithDateRange);
}
async function getTimeBlock(timeBlockUuid, organizationUuid, userUuid) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(userUuid, organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const result = await (0, time_block_repository_js_1.findByUuid)(organizationId, timeBlockUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Time Block");
    }
    return result;
}
async function createTimeBlock(timeBlock) {
    /*
     * Never trust requestUserUuid from the
     * request body.
     */
    await (0, user_service_js_1.AuthorizeOrganizationUser)(timeBlock.requestUserUuid, timeBlock.organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(timeBlock.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const requestUserId = await (0, user_service_js_1.getUserIdByUuid)(timeBlock.requestUserUuid);
    if (requestUserId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Request User");
    }
    const result = await (0, time_block_repository_js_1.create)({
        ...timeBlock,
        organizationId,
        requestUserId,
    });
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError();
    }
    return result;
}
async function updateTimeBlock(timeBlock) {
    await (0, user_service_js_1.AuthorizeOrganizationUser)(timeBlock.respondUserUuid, timeBlock.organizationUuid);
    const organizationId = await (0, organizaiton_repository_js_1.findIdByUuid)(timeBlock.organizationUuid);
    if (organizationId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    const respondUserId = await (0, user_service_js_1.getUserIdByUuid)(timeBlock.respondUserUuid);
    if (respondUserId === undefined) {
        throw new not_found_error_js_1.NotFoundError("Responding User");
    }
    const result = await (0, time_block_repository_js_1.update)({
        ...timeBlock,
        respondUserId,
    }, organizationId);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Time Block");
    }
    return result;
}
