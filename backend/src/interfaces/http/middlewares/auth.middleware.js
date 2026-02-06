const { AppError } = require("../../../common/errors");

function authenticationMiddleware(authService) {
    return (req, _res, next) => {
        const authHeader = req.headers.authorization || "";
        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return next(new AppError("Autenticacao obrigatoria.", 401, "AUTH_REQUIRED"));
        }

        const decoded = authService.verifyToken(token);
        req.user = {
            id: decoded.sub,
            role: decoded.role,
            email: decoded.email
        };

        return next();
    };
}

function authorizeRoles(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new AppError("Autenticacao obrigatoria.", 401, "AUTH_REQUIRED"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError("Permissao insuficiente.", 403, "FORBIDDEN"));
        }

        return next();
    };
}

module.exports = {
    authenticationMiddleware,
    authorizeRoles
};
