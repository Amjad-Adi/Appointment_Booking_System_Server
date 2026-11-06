"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const app_error_js_1 = require("./app-error.js");
class ForbiddenError extends app_error_js_1.AppError {
    code;
    constructor() {
        super("Forbidden", 403);
        this.code = 'FORBIDDEN';
    }
}
exports.ForbiddenError = ForbiddenError;
