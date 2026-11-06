"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapEmailError = mapEmailError;
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const too_many_requests_js_1 = require("../errors/too-many-requests.js");
function mapEmailError(error) {
    if (!(error instanceof Error) || !("code" in error)) {
        throw error;
    }
    const code = String(error.code);
    switch (code) {
        case "EENVELOPE": // Invalid sender/recipient address
        case "EMESSAGE": // Malformed message structure
            throw new bad_request_error_js_1.BadRequestError();
        case "ERATELIMIT": // Provider API rate limit reached
        case "EPROTOCOL": // Server usage policy exceeded (e.g., Gmail 500/day limit)
            throw new too_many_requests_js_1.TooManyRequests();
        default:
            throw error;
    }
}
