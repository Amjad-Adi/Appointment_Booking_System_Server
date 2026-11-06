"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizations = getOrganizations;
exports.getNumberOfOrganizations = getNumberOfOrganizations;
exports.getOrganization = getOrganization;
exports.createOrganization = createOrganization;
exports.updateOrganization = updateOrganization;
exports.updateOrganizationByAdmin = updateOrganizationByAdmin;
exports.getUserOrganization = getUserOrganization;
exports.getOrganizationIdByUuid = getOrganizationIdByUuid;
exports.createOrganizationByAdmin = createOrganizationByAdmin;
const organizaiton_repository_js_1 = require("../repositories/organizaiton.repository.js");
const user_repository_1 = require("../repositories/user.repository");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const conflict_error_js_1 = require("../errors/conflict.error.js");
const user_service_js_1 = require("./user.service.js");
const forbidden_error_js_1 = require("../errors/forbidden.error.js");
async function getOrganizations(query) {
    const result = await (0, organizaiton_repository_js_1.findAll)(query);
    return result.map((row) => ({
        uuid: row.uuid,
        name: row.name,
        email: row.email,
        phoneNumber: row.phoneNumber,
        bio: row.bio,
        profilePicturePath: row.profilePicturePath,
        location: {
            name: row.locationName,
            timezone: row.timezone,
            locationOnMap: [row.longitude, row.latitude],
            createdAtUTC: row.locationCreatedAtUTC,
            updatedAtUTC: row.locationUpdatedAtUTC,
        },
        createdAtUTC: row.createdAtUTC,
        updatedAtUTC: row.updatedAtUTC,
        status: row.status
    }));
}
async function getNumberOfOrganizations(query) {
    return await (0, organizaiton_repository_js_1.countAll)(query);
}
async function getOrganization(uuid) {
    const result = await (0, organizaiton_repository_js_1.findByUuid)(uuid);
    console.log("hi" + result);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    return {
        uuid: result.uuid,
        name: result.name,
        email: result.email,
        phoneNumber: result.phoneNumber,
        bio: result.bio,
        profilePicturePath: result.profilePicturePath,
        location: {
            name: result.locationName,
            timezone: result.timezone,
            locationOnMap: [result.longitude, result.latitude],
            createdAtUTC: result.locationCreatedAtUTC,
            updatedAtUTC: result.locationUpdatedAtUTC,
        },
        createdAtUTC: result.createdAtUTC,
        updatedAtUTC: result.updatedAtUTC,
        status: result.status
    };
}
async function createOrganization(organization) {
    const [emailFound, phoneNumberFound, userWorking] = await Promise.all([await (0, organizaiton_repository_js_1.isEmailFound)(organization.email), await (0, organizaiton_repository_js_1.isPhoneNumberFound)(organization.phoneNumber), (await (0, user_service_js_1.isUserWorkingByUuid)(organization.organizationOwnerUuid))]);
    if (emailFound || phoneNumberFound || userWorking) {
        throw new conflict_error_js_1.ConflictError();
    }
    const result = await (0, organizaiton_repository_js_1.create)(organization);
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError();
    }
    return result;
}
async function updateOrganization(organization) {
    if ((await getUserOrganization(organization.userUuid)).uuid != organization.uuid) {
        throw new forbidden_error_js_1.ForbiddenError();
    }
    const result = await (0, organizaiton_repository_js_1.update)(organization);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("organization");
    }
    return result;
}
async function updateOrganizationByAdmin(organization) {
    const result = await (0, organizaiton_repository_js_1.updateByAdmin)(organization);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("organization");
    }
    return result;
}
async function getUserOrganization(userUuid) {
    const result = await (0, organizaiton_repository_js_1.findUserOrganizationByUuid)(userUuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    return {
        uuid: result.uuid,
        name: result.name,
        email: result.email,
        phoneNumber: result.phoneNumber,
        bio: result.bio,
        profilePicturePath: result.profilePicturePath,
        location: {
            name: result.locationName,
            timezone: result.timezone,
            locationOnMap: [result.longitude, result.latitude],
            createdAtUTC: result.locationCreatedAtUTC,
            updatedAtUTC: result.locationUpdatedAtUTC,
        },
        createdAtUTC: result.createdAtUTC,
        updatedAtUTC: result.updatedAtUTC,
        status: result.status
    };
}
async function getOrganizationIdByUuid(uuid) {
    const result = await (0, organizaiton_repository_js_1.findIdByUuid)(uuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("Organization");
    }
    return result;
}
async function createOrganizationByAdmin(organization) {
    const [emailFound, phoneNumberFound, user] = await Promise.all([await (0, organizaiton_repository_js_1.isEmailFound)(organization.email), await (0, organizaiton_repository_js_1.isPhoneNumberFound)(organization.phoneNumber), await (0, user_repository_1.findByEmail)(organization.userEmail)]);
    if (user === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    if (emailFound || phoneNumberFound || user.organizationUuid !== null) {
        throw new conflict_error_js_1.ConflictError();
    }
    const { userEmail, ...organizationData } = organization;
    const createData = {
        ...organizationData,
        organizationOwnerUuid: user.uuid,
    };
    return await createOrganization(createData);
}
