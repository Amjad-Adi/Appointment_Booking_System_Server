import express from "express";
import {ErrorHandler} from "./server/middlewares/error-handler.js";
import {NotFoundError} from "./server/errors/not-found.error.js";
import { ErrorRequestHandler } from "express"
import {mainRouter} from "./server/routes/main-router.route.js";
import { randomUUID } from "crypto";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import RateLimiterMemory from "rate-limiter-flexible";//Redis is better tan memory because it handles multi servers
import pino from "pino";
import {pinoHttp} from "pino-http";
import {BadRequestError} from "./server/errors/bad-request.error.js";
import bodyParserErrorHandler from "express-body-parser-error-handler";
import {RATE_LIMIT_FOR_GENERAL, rateLimit, rateLimiterFactory} from "./server/middlewares/rate-limiter.js";
import {pageRouter} from "./client/page-router.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
const logger = pino();
export let app = express();
app.set("query parser", "extended");
const corsOptions = {
    origin: process.env.NODE_ENV=="production"?"https://myserver":"http://localhost:3000",
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
app.use(express.json({limit: "100kb"}));
app.use(bodyParserErrorHandler() as unknown as ErrorRequestHandler);
app.use("/api",mainRouter)
app.use(express.static(path.join(__dirname, "client")));
app.use("/",pageRouter)
app.use((req,res)=>
    {throw new NotFoundError("Resource")})
app.use(ErrorHandler);
