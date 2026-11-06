"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateParameter = validateParameter;
exports.validateQuery = validateQuery;
exports.validateBodyByRole = validateBodyByRole;
const bad_request_error_js_1 = require("../errors/bad-request.error.js");
const not_found_error_js_1 = require("../errors/not-found.error.js");
function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        console.log(req.body);
        if (!result.success) {
            console.log(result);
            throw new bad_request_error_js_1.BadRequestError();
        }
        req.body = result.data;
        next();
    };
}
function validateParameter(schema, parameterName) {
    return (req, res, next) => {
        const result = schema.safeParse(req.params[parameterName]);
        if (!result.success) {
            throw new not_found_error_js_1.NotFoundError();
        }
        next();
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        console.log(result);
        if (!result.success) {
            throw new bad_request_error_js_1.BadRequestError();
        }
        req.validatedQuery = result.data;
        next();
    };
}
function validateBodyByRole(roleToSchema) {
    return (req, res, next) => {
        const schema = roleToSchema[req.user?.role];
        const result = schema.safeParse(req.body);
        if (!result.success) {
            throw new bad_request_error_js_1.BadRequestError();
        }
        req.body = result.data;
        next();
    };
}
