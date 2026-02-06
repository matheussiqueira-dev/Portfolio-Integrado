const { AppError, isAppError } = require("../../../common/errors");

function notFoundMiddleware(_req, _res, next) {
    next(new AppError("Rota nao encontrada.", 404, "ROUTE_NOT_FOUND"));
}

function errorMiddleware({ logger, config }) {
    return (error, req, res, _next) => {
        const appError = isAppError(error)
            ? error
            : new AppError("Erro interno inesperado.", 500, "INTERNAL_ERROR");

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
                details: appError.details,
                requestId: req.requestId
            }
        });
    };
}

module.exports = {
    notFoundMiddleware,
    errorMiddleware
};
