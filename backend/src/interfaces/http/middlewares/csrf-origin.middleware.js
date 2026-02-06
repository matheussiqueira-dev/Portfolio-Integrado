const { AppError } = require("../../../common/errors");

function csrfOriginGuard(config) {
    const allowedOrigins = new Set(config.corsOrigins || []);

    return (req, _res, next) => {
        const method = req.method.toUpperCase();
        const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

        if (!isStateChanging) {
            return next();
        }

        const origin = req.headers.origin;
        if (!origin) {
            return next();
        }

        if (!allowedOrigins.size || allowedOrigins.has(origin)) {
            return next();
        }

        return next(new AppError("Origem nao permitida.", 403, "ORIGIN_NOT_ALLOWED"));
    };
}

module.exports = {
    csrfOriginGuard
};
