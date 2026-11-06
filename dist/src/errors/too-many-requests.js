"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequests = void 0;
const app_error_js_1 = require("./app-error.js");
class TooManyRequests extends app_error_js_1.AppError {
    code;
    constructor() {
        super("Too Many Requests", 429);
        this.code = 'TOO MANY REQUESTS';
    }
}
exports.TooManyRequests = TooManyRequests;
