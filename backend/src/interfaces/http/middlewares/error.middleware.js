const { AppError, isAppError } = require("../../../common/errors");

function notFoundMiddleware(_req, _res, next) {
    next(new AppError("Rota nao encontrada.", 404, "ROUTE_NOT_FOUND"));
}

function errorMiddleware({ logger, config }) {
    return (error, req, res, _next) => {
        const appError = isAppError(error)
            ? error
            : new AppError("Erro interno inesperado.", 500, "INTERNAL_ERROR");

        if (appError.code === "AUTH_LOCKED" && appError.details?.retryAfterSeconds) {
            res.setHeader("Retry-After", String(appError.details.retryAfterSeconds));
        }

        logger.error(
            {
                requestId: req.requestId,
                code: appError.code,
                statusCode: appError.statusCode,
                details: appError.details,
                stack: config.isProduction ? undefined : error.stack
            },
            appError.message
        );

        res.status(appError.statusCode).json({
            error: {
                code: appError.code,
                message: appError.message,
                details: normalizeErrorDetails(appError, config.isProduction),
                requestId: req.requestId
            }
        });
    };
}

function normalizeErrorDetails(appError, isProduction) {
    if (!isProduction) {
        return appError.details;
    }

    if (appError.code === "VALIDATION_ERROR") {
        return appError.details;
    }

    if (appError.code === "AUTH_LOCKED") {
        return appError.details;
    }

    return null;
}

module.exports = {
    notFoundMiddleware,
    errorMiddleware
};
