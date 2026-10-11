import { RATE_LIMIT_FOR_GENERAL, RATE_LIMIT_FOR_AUTHENTICATION, rateLimit, rateLimiterFactory } from "../middlewares/rate-limiter";

export const generalRateLimiter = rateLimit(
    rateLimiterFactory(RATE_LIMIT_FOR_GENERAL)
);

export const authenticationRateLimiter = rateLimit(
    rateLimiterFactory(RATE_LIMIT_FOR_AUTHENTICATION)
);