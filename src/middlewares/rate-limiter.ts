import { type Request, type Response, type NextFunction, type RequestHandler } from "express";
import {ipKeyGenerator, rateLimit as expressRateLimit} from "express-rate-limit";
import { TooManyRequests } from "../errors/too-many-requests.js";
import {} from "../utils/Request.js";
const DURATION = 60;
const GLOBAL_AUTHENTICATION_POINTS = 1000;
const GLOBAL_GENERAL_POINTS = 10000;
const GLOBAL_EXPENSIVE_OPERATION = 1000;
const LOCAL_AUTHENTICATION_POINTS = 5;
const LOCAL_GENERAL_POINTS = 100;
const LOCAL_EXPENSIVE_OPERATION = 10;
export const RATE_LIMIT_FOR_AUTHENTICATION = "AUTHENTICATION";
export const RATE_LIMIT_FOR_GENERAL = "GENERAL";
export const RATE_LIMIT_FOR_EXPENSIVE = "EXPENSIVE";

export class RateLimiter {
    globalLimiter: RequestHandler;
    localLimiter: RequestHandler;

    constructor(globalPoints: number, localPoints: number) {
        this.globalLimiter = expressRateLimit({
            windowMs: DURATION * 1000,
            limit: globalPoints,
            keyGenerator: () => "global",
            handler: (req, res, next) => {
                next(new TooManyRequests());
            },
            standardHeaders: false,
            legacyHeaders: false,
        });
        this.localLimiter = expressRateLimit({
            windowMs: DURATION * 1000,
            limit: localPoints,
            keyGenerator: (req: Request) => req.user?.uuid ?? ipKeyGenerator(req.ip as string),
            handler: (req, res, next) => {
                next(new TooManyRequests());
            },
            standardHeaders: "draft-7",
            legacyHeaders: false,
        });
    }
}

export function rateLimiterFactory(rateLimiterType: string): RateLimiter {
    switch (rateLimiterType) {
        case RATE_LIMIT_FOR_AUTHENTICATION:
            return new RateLimiter(GLOBAL_AUTHENTICATION_POINTS, LOCAL_AUTHENTICATION_POINTS);
        case RATE_LIMIT_FOR_EXPENSIVE:
            return new RateLimiter(GLOBAL_EXPENSIVE_OPERATION, LOCAL_EXPENSIVE_OPERATION);
        case RATE_LIMIT_FOR_GENERAL:
        default:
            return new RateLimiter(GLOBAL_GENERAL_POINTS, LOCAL_GENERAL_POINTS);
    }
}

export function rateLimit(rateLimiter: RateLimiter) {
    return (req: Request, res: Response, next: NextFunction) => {
        rateLimiter.globalLimiter(req, res, (err) => {
            rateLimiter.localLimiter(req, res, next);
        });
    };
}