"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const app_error_js_1 = require("./app-error.js");
class BadRequestError extends app_error_js_1.AppError {
    code;
    constructor(message = "Bad Request") {
        super(message, 400);
        this.code = 'BAD_REQUEST';
    }
}
exports.BadRequestError = BadRequestError;
