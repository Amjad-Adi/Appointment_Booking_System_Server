import express from "express";
import {ErrorHandler} from "./src/middlewares/error-handler.js";
import {NotFoundError} from "./src/errors/not-found.error.js";
import { ErrorRequestHandler } from "express"
import {mainRouter} from "./src/routes/main-router.route.js";
import { randomUUID } from "crypto";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import RateLimiterMemory from "rate-limiter-flexible";//Redis is better tan memory because it handles multi servers
import pino from "pino";
import {pinoHttp} from "pino-http";
import {BadRequestError} from "./src/errors/bad-request.error.js";
import bodyParserErrorHandler from "express-body-parser-error-handler";
import {RATE_LIMIT_FOR_GENERAL, rateLimit, RateLimiter, rateLimiterFactory} from "./src/middlewares/rate-limiter.js";
const rateLimiter:RateLimiter=rateLimiterFactory(RATE_LIMIT_FOR_GENERAL)
const logger = pino();
export const app = express();
app.set("query parser", "extended");
const corsOptions = {
    origin: process.env.NODE_ENV=="production"?"https://myserver":"http://localhost:8080",
    credentials: true
};
app.use((req, res, next) => {
    console.log(`request received ${req.method} ${req.url}`);
    next();
});
app.use((req, res, next) => {
    req.id = randomUUID();
    next();
});
app.use(pinoHttp({logger}));
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({limit: "10mb"}));
app.use(bodyParserErrorHandler() as unknown as ErrorRequestHandler);
app.use(rateLimit(rateLimiter))
app.use("/api",mainRouter)
app.use((req,res)=>
{throw new NotFoundError("Resource")})
app.use(ErrorHandler);
