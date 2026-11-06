"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const error_handler_js_1 = require("./src/middlewares/error-handler.js");
const not_found_error_js_1 = require("./src/errors/not-found.error.js");
const main_router_route_js_1 = require("./src/routes/main-router.route.js");
const crypto_1 = require("crypto");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = require("pino-http");
const express_body_parser_error_handler_1 = __importDefault(require("express-body-parser-error-handler"));
const rate_limiter_js_1 = require("./src/middlewares/rate-limiter.js");
const rateLimiter = (0, rate_limiter_js_1.rateLimiterFactory)(rate_limiter_js_1.RATE_LIMIT_FOR_GENERAL);
const logger = (0, pino_1.default)();
exports.app = (0, express_1.default)();
exports.app.set("query parser", "extended");
const corsOptions = {
    origin: process.env.NODE_ENV == "production" ? "https://myserver" : "http://localhost:8080",
    credentials: true
};
exports.app.use((req, res, next) => {
    console.log(`request received ${req.method} ${req.url}`);
    next();
});
exports.app.use((req, res, next) => {
    req.id = (0, crypto_1.randomUUID)();
    next();
});
exports.app.use((0, pino_http_1.pinoHttp)({ logger }));
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)(corsOptions));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.json({ limit: "10mb" }));
exports.app.use((0, express_body_parser_error_handler_1.default)());
exports.app.use((0, rate_limiter_js_1.rateLimit)(rateLimiter));
exports.app.use("/api", main_router_route_js_1.mainRouter);
exports.app.use((req, res) => { throw new not_found_error_js_1.NotFoundError("Resource"); });
exports.app.use(error_handler_js_1.ErrorHandler);
