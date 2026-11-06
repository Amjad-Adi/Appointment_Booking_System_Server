"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getNumberOfUsers = getNumberOfUsers;
exports.getUser = getUser;
exports.getUserByFireBaseUid = getUserByFireBaseUid;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.updateUserByAdmin = updateUserByAdmin;
exports.isUserWorkingByUuid = isUserWorkingByUuid;
exports.isUserWorkingByEmail = isUserWorkingByEmail;
exports.getUserIdByUuid = getUserIdByUuid;
exports.getUserUidByUuid = getUserUidByUuid;
exports.AuthorizeOrganizationUser = AuthorizeOrganizationUser;
const user_repository_js_1 = require("../repositories/user.repository.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const conflict_error_js_1 = require("../errors/conflict.error.js");
const organizaiton_repository_js_1 = require("../repositories/organizaiton.repository.js");
const forbidden_error_js_1 = require("../errors/forbidden.error.js");
const organization_service_js_1 = require("./organization.service.js");
async function getUsers(query) {
    return (await (0, user_repository_js_1.findAll)(query));
}
async function getNumberOfUsers(query) {
    return (await (0, user_repository_js_1.countAll)(query));
}
async function getUser(uuid) {
    const result = await (0, user_repository_js_1.findByUuid)(uuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    return result;
}
async function getUserByFireBaseUid(uid) {
    const result = await (0, user_repository_js_1.findByUid)(uid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    return result;
}
async function getUserById(id) {
    const result = await (0, user_repository_js_1.findById)(id);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    return result;
}
async function createUser(user) {
    if (await (0, user_repository_js_1.findByEmail)(user.email) !== undefined) {
        throw new conflict_error_js_1.ConflictError();
    }
    const result = await (0, user_repository_js_1.create)(user);
    if (result === undefined) {
        throw new bad_request_error_js_1.BadRequestError();
    }
    return result;
}
async function updateUser(user) {
    const result = await (0, user_repository_js_1.update)(user);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("user");
    }
    return result;
}
async function updateUserByAdmin(user) {
    const result = await (0, user_repository_js_1.updateByAdmin)(user);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("user");
    }
    return result;
}
async function isUserWorkingByUuid(userUuid) {
    return (await (0, organizaiton_repository_js_1.findUserOrganizationByUuid)(userUuid)) !== undefined;
}
async function isUserWorkingByEmail(userEmail) {
    return (await (0, organizaiton_repository_js_1.findUserOrganizationByEmail)(userEmail)) !== undefined;
}
async function getUserIdByUuid(uuid) {
    let result = await (0, user_repository_js_1.findIdByUuid)(uuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    return result;
}
async function getUserUidByUuid(uuid) {
    let result = await (0, user_repository_js_1.findUidByUuid)(uuid);
    if (result === undefined) {
        throw new not_found_error_js_1.NotFoundError("User");
    }
    return result;
}
async function AuthorizeOrganizationUser(userUuid, organizationUuid) {
    if ((await (0, organization_service_js_1.getUserOrganization)(userUuid))?.uuid !== organizationUuid) {
        throw new forbidden_error_js_1.ForbiddenError();
    }
    return true;
}
