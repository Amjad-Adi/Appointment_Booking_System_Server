"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const app_error_js_1 = require("./app-error.js");
class UnauthorizedError extends app_error_js_1.AppError {
    code;
    constructor(message = "UNAUTHORIZED") {
        super(message, 401);
        this.code = 'UNAUTHORIZED';
    }
}
exports.UnauthorizedError = UnauthorizedError;
