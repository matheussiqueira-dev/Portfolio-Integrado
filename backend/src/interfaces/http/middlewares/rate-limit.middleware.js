const rateLimit = require("express-rate-limit");

function createGeneralRateLimiter(config) {
    return rateLimit({
        windowMs: config.rateLimitWindowMs,
        limit: config.rateLimitMax,
        standardHeaders: true,
        legacyHeaders: false
    });
}

function createAuthRateLimiter() {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false
    });
}

function createContactRateLimiter() {
    return rateLimit({
        windowMs: 10 * 60 * 1000,
        limit: 6,
        standardHeaders: true,
        legacyHeaders: false
    });
}

module.exports = {
    createGeneralRateLimiter,
    createAuthRateLimiter,
    createContactRateLimiter
};
