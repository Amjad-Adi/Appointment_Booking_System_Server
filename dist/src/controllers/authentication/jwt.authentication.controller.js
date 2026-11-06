"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenExpiresIn = exports.REFRESH_TOKEN_EXPIRES_FOR_DEPLOYMENT = exports.REFRESH_TOKEN_EXPIRES_FOR_DEVELOPMENT = exports.ACCESS_TOKEN_EXPIRES_FOR_DEVELOPMENT = exports.ACCESS_TOKEN_EXPIRES_FOR_DEPLOYMENT = exports.JWT_SECRET = void 0;
exports.authenticateToken = authenticateToken;
exports.generateToken = generateToken;
const unauthorized_error_1 = require("../../errors/unauthorized.error");
const crypto_1 = __importDefault(require("crypto"));
const hash_1 = require("../../utils/hash");
const jwt_management_service_1 = require("../../services/jwt-management-service");
const user_service_1 = require("../../services/user.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_management_service_2 = require("../../services/jwt-management-service");
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.ACCESS_TOKEN_EXPIRES_FOR_DEPLOYMENT = "12h";
exports.ACCESS_TOKEN_EXPIRES_FOR_DEVELOPMENT = "1d";
exports.REFRESH_TOKEN_EXPIRES_FOR_DEVELOPMENT = 365 * 24 * 60 * 60 * 1000;
exports.REFRESH_TOKEN_EXPIRES_FOR_DEPLOYMENT = 365 * 24 * 60 * 60 * 1000;
exports.refreshTokenExpiresIn = process.env.NODE_ENV === "development" ? exports.REFRESH_TOKEN_EXPIRES_FOR_DEVELOPMENT : exports.REFRESH_TOKEN_EXPIRES_FOR_DEPLOYMENT;
async function authenticateToken(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) {
        throw new unauthorized_error_1.UnauthorizedError();
    }
    try {
        const verifyOptions = {
            issuer: "appointment-booking-server",
            audience: "appointment-booking-api",
        };
        const decodedToken = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET, verifyOptions);
        if (!decodedToken.sub || !decodedToken.jti) {
            throw new unauthorized_error_1.UnauthorizedError();
        }
        const blacklistedToken = await (0, jwt_management_service_2.getBlackListedToken)(decodedToken.jti);
        if (blacklistedToken) {
            throw new unauthorized_error_1.UnauthorizedError();
        }
        const userUid = decodedToken.sub;
        const user = await (0, user_service_1.getUserByFireBaseUid)(userUid);
        if (typeof decodedToken.sub !== "string" || typeof decodedToken.jti !== "string" || typeof decodedToken.exp !== "number") {
            throw new unauthorized_error_1.UnauthorizedError();
        }
        req.user = {
            ...user,
            uid: decodedToken.sub,
            jti: decodedToken.jti,
            exp: new Date(decodedToken.exp * 1000)
        };
        next();
    }
    catch (e) {
        if (e instanceof jsonwebtoken_1.default.TokenExpiredError || e instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new unauthorized_error_1.UnauthorizedError());
        }
        return next(e);
    }
}
async function generateToken(userUid) {
    const payload = {
        sub: userUid
    };
    const signOptions = {
        expiresIn: process.env.NODE_ENV == "development" ? exports.ACCESS_TOKEN_EXPIRES_FOR_DEVELOPMENT : exports.ACCESS_TOKEN_EXPIRES_FOR_DEPLOYMENT,
        issuer: "appointment-booking-server",
        audience: "appointment-booking-api",
        jwtid: crypto_1.default.randomUUID()
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, exports.JWT_SECRET, signOptions);
    const refreshToken = (0, hash_1.generateRawToken)();
    const refreshHashedToken = (0, hash_1.generateHashToken)(refreshToken);
    const currentUser = await (0, user_service_1.getUserByFireBaseUid)(userUid);
    const currentUserId = await (0, user_service_1.getUserIdByUuid)(currentUser.uuid);
    const refreshTokenToStore = {
        userId: currentUserId,
        tokenHash: refreshHashedToken,
        expiresAtUTC: new Date(Date.now() + exports.refreshTokenExpiresIn),
    };
    await (0, jwt_management_service_1.createRefreshToken)(refreshTokenToStore);
    return { accessToken, refreshToken };
}
