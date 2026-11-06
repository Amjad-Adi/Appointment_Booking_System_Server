"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const app_error_js_1 = require("./app-error.js");
class ConflictError extends app_error_js_1.AppError {
    code;
    constructor(message = "Conflict") {
        super("Conflict", 409);
        this.code = 'CONFLICT';
    }
}
exports.ConflictError = ConflictError;
