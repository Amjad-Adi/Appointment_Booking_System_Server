"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetUsers = handleGetUsers;
exports.handleGetUser = handleGetUser;
exports.handleGetCurrentUser = handleGetCurrentUser;
exports.handleCreateUser = handleCreateUser;
exports.handleUpdateUser = handleUpdateUser;
exports.handleUpdateCurrentUser = handleUpdateCurrentUser;
exports.handleUpdateUserByAdmin = handleUpdateUserByAdmin;
const user_service_js_1 = require("../services/user.service.js");
const firebase_admin_service_js_1 = require("../services/firebase-admin.service.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const query_model_js_1 = require("../models/query.model.js");
const map_firebase_error_1 = require("../middlewares/map-firebase-error");
const roles_1 = require("../models/enums/roles");
async function handleGetUsers(req, res) {
    const query = req.validatedQuery;
    query.offset = (query?.page - 1) * query?.limit;
    const organizationUuid = req.user?.organizationUuid;
    const currentUserRole = req.user?.role;
    if (currentUserRole !== roles_1.Role.SUPER_ADMIN) {
        if (query.filter?.role === roles_1.Role.CUSTOMER) {
            query.filter.organizationUuid = undefined;
        }
        else {
            query.filter = {
                ...query.filter,
                organizationUuid,
            };
        }
    }
    const [users, totalUsers] = await Promise.all([(0, user_service_js_1.getUsers)(query), (0, user_service_js_1.getNumberOfUsers)(query)]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new query_model_js_1.QueryResponse(users, totalUsers, baseUrl, query?.page, query?.limit);
    return res.status(200).json(responseResult);
}
async function handleGetUser(req, res) {
    const uuid = (req.params.userUuid);
    const result = await (0, user_service_js_1.getUser)(uuid);
    return res.status(200).json(result);
}
async function handleGetCurrentUser(req, res) {
    return res.status(200).json(req.user);
}
async function handleCreateUser(req, res) {
    const user = (req.body);
    let userRecord;
    try {
        userRecord = await (0, firebase_admin_service_js_1.createFireBaseUser)(user.email, user.password);
    }
    catch (err) {
        (0, map_firebase_error_1.mapFirebaseError)(err);
    }
    user.uid = userRecord.uid;
    const result = await (0, user_service_js_1.createUser)(user);
    return res.status(201).json(result);
}
async function handleUpdateUser(req, res) {
    const user = (req.body);
    const result = await (0, user_service_js_1.updateUser)(user);
    return res.status(200).json(result);
}
async function handleUpdateCurrentUser(req, res) {
    const user = (req.body);
    user.uuid = req.user?.uuid;
    user.uid = req.user?.uid;
    if (user.password !== undefined) {
        try {
            await (0, firebase_admin_service_js_1.updateFireBaseUser)(user.uid, user.password);
        }
        catch (err) {
            throw new bad_request_error_js_1.BadRequestError();
        }
    }
    const result = await (0, user_service_js_1.updateUser)(user);
    return res.status(200).json(result);
}
async function handleUpdateUserByAdmin(req, res) {
    const uuid = (req.params.userUuid);
    const user = (req.body);
    user.uuid = uuid;
    const result = await (0, user_service_js_1.updateUserByAdmin)(user);
    return res.status(200).json(result);
}
