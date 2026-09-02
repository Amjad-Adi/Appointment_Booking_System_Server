import express from "express";
import {ErrorHandler} from "./middlewares/error-handler";
import {NotFoundError} from "./errors/not-found.error";
import { ErrorRequestHandler } from "express"
import {mainRouter} from "./routes/main-router.route";
import { randomUUID } from "crypto";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import RateLimiterMemory from "rate-limiter-flexible";
import pino from "pino";
import {pinoHttp} from "pino-http";
import {BadRequestErorr} from "./errors/bad-request.erorr";
import bodyParserErrorHandler from "express-body-parser-error-handler";
const logger = pino();
export let app = express();
const corsOptions = {
<<<<<<< Updated upstream
    origin: process.env.NODE_ENV=="production"?"https://myserver":"http://localhost:3000",
=======
    origin: process.env.NODE_ENV=="production"?"https://myserver":"http://localhost:8080",
    credentials: true
>>>>>>> Stashed changes
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
app.use(rateLimit({ windowMs: 60000, max: 100 }));
app.use("/api",mainRouter)
app.use((req,res)=>
    {throw new NotFoundError("Resource")})
app.use(ErrorHandler);
