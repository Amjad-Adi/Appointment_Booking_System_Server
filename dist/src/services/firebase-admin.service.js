"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFireBaseUser = createFireBaseUser;
exports.updateFireBaseUser = updateFireBaseUser;
exports.revokeUserSessions = revokeUserSessions;
const auth_1 = require("firebase-admin/auth");
const map_firebase_error_js_1 = require("../middlewares/map-firebase-error.js");
async function createFireBaseUser(email, password) {
    try {
        return await (0, auth_1.getAuth)().createUser({
            email: email,
            emailVerified: true,
            password: password
        });
    }
    catch (e) {
        (0, map_firebase_error_js_1.mapFirebaseError)(e);
    }
}
async function updateFireBaseUser(uid, password) {
    try {
        return await (0, auth_1.getAuth)().updateUser(uid, { password: password });
    }
    catch (e) {
        (0, map_firebase_error_js_1.mapFirebaseError)(e);
    }
}
async function revokeUserSessions(uid) {
    try {
        return await (0, auth_1.getAuth)().revokeRefreshTokens(uid);
    }
    catch (e) {
        (0, map_firebase_error_js_1.mapFirebaseError)(e);
    }
}
