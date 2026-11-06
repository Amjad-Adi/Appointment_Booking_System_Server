"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlackListedToken = getBlackListedToken;
exports.createBlacklistedToken = createBlacklistedToken;
exports.createRefreshToken = createRefreshToken;
exports.getRefreshToken = getRefreshToken;
exports.revokeToken = revokeToken;
exports.removeToken = removeToken;
const refresh_token_repository_1 = require("../repositories/refresh-token.repository");
const blacklisted_token_repository_1 = require("../repositories/blacklisted-token.repository");
const unauthorized_error_1 = require("../errors/unauthorized.error");
const hash_1 = require("../utils/hash");
async function getBlackListedToken(jti) {
    return await (0, blacklisted_token_repository_1.findBlacklistedToken)(jti);
}
async function createBlacklistedToken(blacklistedToken) {
    const result = await (0, blacklisted_token_repository_1.create)(blacklistedToken);
    if (result === undefined) {
        throw new Error();
    }
    return result;
}
async function createRefreshToken(refreshToken) {
    const result = await (0, refresh_token_repository_1.create)(refreshToken);
    if (result === undefined) {
        throw new Error();
    }
    return result;
}
async function getRefreshToken(token) {
    const hashedToken = (0, hash_1.hashRefreshToken)(token);
    let result = await (0, refresh_token_repository_1.findRefreshToken)(hashedToken);
    if (result === undefined) {
        throw new unauthorized_error_1.UnauthorizedError();
    }
    return result;
}
async function revokeToken(token) {
    const hashedToken = (0, hash_1.hashRefreshToken)(token);
    await (0, refresh_token_repository_1.revoke)(hashedToken);
}
async function removeToken(token) {
    const hashedToken = (0, hash_1.hashRefreshToken)(token);
    await (0, refresh_token_repository_1.remove)(hashedToken);
}
