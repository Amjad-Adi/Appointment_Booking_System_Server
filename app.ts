import express from "express";
import {ErrorHandler} from "./middlewares/error-handler";
import {NotFoundError} from "./errors/not-found.error";
import { ErrorRequestHandler } from "express"
import {mainRouter} from "./routes/main-router.route";
import { randomUUID } from "crypto";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import RateLimiterMemory from "rate-limiter-flexible";//Redis is better tan memory because it handles multi servers
import pino from "pino";
import {pinoHttp} from "pino-http";
import {BadRequestErorr} from "./errors/bad-request.erorr";
import bodyParserErrorHandler from "express-body-parser-error-handler";
import {RATE_LIMIT_FOR_GENERAL, rateLimit, rateLimiterFactory} from "./middlewares/rate-limiter";
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
app.use((req,res)=>
    {throw new NotFoundError("Resource")})
app.use(ErrorHandler);
