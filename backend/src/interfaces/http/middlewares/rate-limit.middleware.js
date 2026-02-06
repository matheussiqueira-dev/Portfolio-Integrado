const rateLimit = require("express-rate-limit");

function createGeneralRateLimiter(config) {
    return rateLimit({
        windowMs: config.rateLimitWindowMs,
        limit: config.rateLimitMax,
        keyGenerator: request => request.ip,
        standardHeaders: true,
        legacyHeaders: false,
        handler: createRateLimitHandler("RATE_LIMIT_EXCEEDED", "Limite de requisicoes excedido. Tente novamente mais tarde.")
    });
}

function createAuthRateLimiter() {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        keyGenerator: request => `${request.ip}:${String(request.body?.email || "").toLowerCase()}`,
        skipSuccessfulRequests: true,
        standardHeaders: true,
        legacyHeaders: false,
        handler: createRateLimitHandler("AUTH_RATE_LIMIT_EXCEEDED", "Muitas tentativas de autenticacao.")
    });
}

function createContactRateLimiter() {
    return rateLimit({
        windowMs: 10 * 60 * 1000,
        limit: 6,
        keyGenerator: request => request.ip,
        standardHeaders: true,
        legacyHeaders: false,
        handler: createRateLimitHandler("CONTACT_RATE_LIMIT_EXCEEDED", "Muitas tentativas de envio de contato.")
    });
}

function createRateLimitHandler(code, message) {
    return (request, response, _next, options) => {
        response.status(options.statusCode).json({
            error: {
                code,
                message,
                details: {
                    limit: options.limit,
                    windowMs: options.windowMs
                },
                requestId: request.requestId
            }
        });
    };
}

module.exports = {
    createGeneralRateLimiter,
    createAuthRateLimiter,
    createContactRateLimiter
};
