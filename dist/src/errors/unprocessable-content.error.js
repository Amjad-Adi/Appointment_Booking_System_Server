"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnprocessableContentError = void 0;
const app_error_js_1 = require("./app-error.js");
class UnprocessableContentError extends app_error_js_1.AppError {
    code;
    constructor() {
        super("Unprocessable Content", 422);
        this.code = 'UNPROCESSABLE_CONTENT';
    }
}
exports.UnprocessableContentError = UnprocessableContentError;
