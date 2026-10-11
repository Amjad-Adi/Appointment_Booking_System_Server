import express from "express";
import {ErrorHandler} from "./src/middlewares/error-handler";
import {NotFoundError} from "./src/errors/not-found.error";
import { ErrorRequestHandler } from "express"
import {mainRouter} from "./src/routes/main-router.route";
import { randomUUID } from "crypto";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
//Redis is better tan memory because it handles multi servers
import pino from "pino";
import {pinoHttp} from "pino-http";
import bodyParserErrorHandler from "express-body-parser-error-handler";
const logger = pino();
export const app = express();
app.set("query parser", "extended");
const corsOptions = {
    origin: process.env.NODE_ENV=="production"?process.env.FRONTEND_PRODUCTION_URL:process.env.FRONTEND_DEVELOPMENT_URL,
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
app.use("/api",mainRouter)
app.use((req,res)=>
{throw new NotFoundError("Resource")})
app.use(ErrorHandler);
