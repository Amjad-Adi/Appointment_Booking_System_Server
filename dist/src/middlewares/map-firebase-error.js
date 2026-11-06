"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapFirebaseError = mapFirebaseError;
const conflict_error_js_1 = require("../errors/conflict.error.js");
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
const forbidden_error_js_1 = require("../errors/forbidden.error.js");
const unauthorized_error_js_1 = require("../errors/unauthorized.error.js");
function mapFirebaseError(error) {
    if (!(error instanceof Error) || !("code" in error)) {
        throw error;
    }
    switch (error.code) {
        case "auth/email-already-exists":
        case "auth/phone-number-already-exists":
        case "auth/uid-already-exists":
            throw new conflict_error_js_1.ConflictError();
        case "auth/invalid-email":
        case "auth/missing-email":
        case "auth/missing-uid":
        case "auth/missing-password":
        case "auth/invalid-password":
        case "auth/missing-oauth-client-secret":
        case "auth/missing-ios-bundle-id":
        case "auth/unauthorized-continue-uri":
        case "auth/invalid-continue-uri":
        case "auth/operation-not-allowed":
            throw new bad_request_error_js_1.BadRequestError();
        case "auth/user-not-found":
            throw new not_found_error_js_1.NotFoundError("User");
        case "auth/user-disabled":
            throw new forbidden_error_js_1.ForbiddenError();
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/invalid-login-credentials":
        case "auth/id-token-expired":
        case "auth/id-token-revoked":
        case "auth/invalid-id-token":
        case "auth/argument-error":
            throw new unauthorized_error_js_1.UnauthorizedError("Invalid email or password");
        default:
            throw error;
    }
}
