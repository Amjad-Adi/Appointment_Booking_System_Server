"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = ErrorHandler;
const app_error_js_1 = require("../errors/app-error.js");
function ErrorHandler(err, Req, res, next) {
    console.error(err);
    if (err instanceof app_error_js_1.AppError) {
        return res.status(err.statusCode).json({ status: err.status, message: err.message });
    }
    return res.status(500).json({ status: "Error", message: "Internal Server Error" });
}
