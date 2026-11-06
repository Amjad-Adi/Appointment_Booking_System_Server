"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const app_error_js_1 = require("./app-error.js");
class NotFoundError extends app_error_js_1.AppError {
    code;
    constructor(resource = "Resource") {
        super(`${resource} Not Found`, 404);
        this.code = 'NOT_FOUND';
    }
}
exports.NotFoundError = NotFoundError;
