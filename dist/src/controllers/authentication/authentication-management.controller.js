"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.invitationLogin = invitationLogin;
exports.refreshToken = refreshToken;
exports.logOut = logOut;
const firebase_client_service_js_1 = require("../../services/firebase-client.service.js");
const auth_1 = require("firebase/auth");
const unauthorized_error_js_1 = require("../../errors/unauthorized.error.js");
const jwt_authentication_controller_js_1 = require("./jwt.authentication.controller.js");
const user_service_js_1 = require("../../services/user.service.js");
const jwt_management_service_js_1 = require("../../services/jwt-management-service.js");
//Cookie options look up best practises
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
};
const accessCookieOptions = cookieOptions && { maxAge: process.env.NODE_ENV === "development"
        ? 25 * 60 * 60 * 1000
        : 13 * 60 * 60 * 1000,
};
const refreshCookieOptions = cookieOptions && { maxAge: jwt_authentication_controller_js_1.refreshTokenExpiresIn + 60 * 60 * 1000 };
async function login(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const uid = await (0, firebase_client_service_js_1.fireBaseLogIn)((0, auth_1.getAuth)(), email, password);
    if (uid == undefined) {
        throw new unauthorized_error_js_1.UnauthorizedError();
    }
    const user = await (0, user_service_js_1.getUserByFireBaseUid)(uid);
    const tokens = await (0, jwt_authentication_controller_js_1.generateToken)(uid);
    res.cookie('accessToken', tokens.accessToken, accessCookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    res.status(200).json(user);
}
async function invitationLogin(req, res, next) {
    const email = req.query.email;
    const uid = "hi"; //await invitationReceive(getAuth(),email,signInLink) ;//REQUIRES FRONT END
    if (uid == undefined) {
        throw new unauthorized_error_js_1.UnauthorizedError();
    }
    const user = await (0, user_service_js_1.getUserByFireBaseUid)(uid);
    const tokens = await (0, jwt_authentication_controller_js_1.generateToken)(uid);
    res.cookie('accessToken', tokens.accessToken, accessCookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    res.status(200).json({ user });
}
async function refreshToken(req, res, next) {
    const refreshTokenString = req.cookies.refreshToken;
    if (refreshTokenString === undefined) {
        throw new unauthorized_error_js_1.UnauthorizedError();
    }
    const refreshTokenRecord = await (0, jwt_management_service_js_1.getRefreshToken)(refreshTokenString);
    if (!refreshTokenRecord) {
        throw new unauthorized_error_js_1.UnauthorizedError();
    }
    if (refreshTokenRecord.revoked) {
        throw new unauthorized_error_js_1.UnauthorizedError();
    }
    if (Date.now() > refreshTokenRecord.expiresAtUTC.getTime()) {
        await (0, jwt_management_service_js_1.removeToken)(refreshTokenString);
        throw new unauthorized_error_js_1.UnauthorizedError();
    }
    const user = await (0, user_service_js_1.getUserById)(refreshTokenRecord.userId);
    const uid = await (0, user_service_js_1.getUserUidByUuid)(user.uuid);
    const tokens = await (0, jwt_authentication_controller_js_1.generateToken)(uid);
    await (0, jwt_management_service_js_1.removeToken)(refreshTokenString);
    res.cookie('accessToken', tokens.accessToken, accessCookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    res.status(200).json({ user });
}
async function logOut(req, res, next) {
    const blackListedToken = {
        jti: req.user?.jti,
        expiresAtUTC: req.user?.exp,
        reason: "logout"
    };
    await (0, jwt_management_service_js_1.createBlacklistedToken)(blackListedToken);
    const refreshTokenString = req.cookies.refreshToken;
    await (0, jwt_management_service_js_1.revokeToken)(refreshTokenString);
    res.clearCookie('refreshToken');
    res.status(204).send();
}
