"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = exports.RATE_LIMIT_FOR_EXPENSIVE = exports.RATE_LIMIT_FOR_GENERAL = exports.RATE_LIMIT_FOR_AUTHENTICATION = void 0;
exports.rateLimiterFactory = rateLimiterFactory;
exports.rateLimit = rateLimit;
const express_rate_limit_1 = require("express-rate-limit");
const too_many_requests_js_1 = require("../errors/too-many-requests.js");
const DURATION = 60;
const GLOBAL_AUTHENTICATION_POINTS = 1000;
const GLOBAL_GENERAL_POINTS = 10000;
const GLOBAL_EXPENSIVE_OPERATION = 1000;
const LOCAL_AUTHENTICATION_POINTS = 5;
const LOCAL_GENERAL_POINTS = 100;
const LOCAL_EXPENSIVE_OPERATION = 10;
exports.RATE_LIMIT_FOR_AUTHENTICATION = "AUTHENTICATION";
exports.RATE_LIMIT_FOR_GENERAL = "GENERAL";
exports.RATE_LIMIT_FOR_EXPENSIVE = "EXPENSIVE";
class RateLimiter {
    globalLimiter;
    localLimiter;
    constructor(globalPoints, localPoints) {
        this.globalLimiter = (0, express_rate_limit_1.rateLimit)({
            windowMs: DURATION * 1000,
            limit: globalPoints,
            keyGenerator: () => "global",
            handler: (req, res, next) => {
                next(new too_many_requests_js_1.TooManyRequests());
            },
            standardHeaders: false,
            legacyHeaders: false,
        });
        this.localLimiter = (0, express_rate_limit_1.rateLimit)({
            windowMs: DURATION * 1000,
            limit: localPoints,
            keyGenerator: (req) => req.user?.uuid ?? (0, express_rate_limit_1.ipKeyGenerator)(req.ip),
            handler: (req, res, next) => {
                next(new too_many_requests_js_1.TooManyRequests());
            },
            standardHeaders: "draft-7",
            legacyHeaders: false,
        });
    }
}
exports.RateLimiter = RateLimiter;
function rateLimiterFactory(rateLimiterType) {
    switch (rateLimiterType) {
        case exports.RATE_LIMIT_FOR_AUTHENTICATION:
            return new RateLimiter(GLOBAL_AUTHENTICATION_POINTS, LOCAL_AUTHENTICATION_POINTS);
        case exports.RATE_LIMIT_FOR_EXPENSIVE:
            return new RateLimiter(GLOBAL_EXPENSIVE_OPERATION, LOCAL_EXPENSIVE_OPERATION);
        case exports.RATE_LIMIT_FOR_GENERAL:
        default:
            return new RateLimiter(GLOBAL_GENERAL_POINTS, LOCAL_GENERAL_POINTS);
    }
}
function rateLimit(rateLimiter) {
    return (req, res, next) => {
        rateLimiter.globalLimiter(req, res, (err) => {
            rateLimiter.localLimiter(req, res, next);
        });
    };
}
