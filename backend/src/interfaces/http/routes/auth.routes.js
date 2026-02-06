const express = require("express");
const { validate } = require("../middlewares/validate.middleware");
const { authenticationMiddleware } = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../middlewares/async-handler.middleware");
const { loginSchema } = require("../schemas/schemas");

function createAuthRouter({ authService, authRateLimiter }) {
    const router = express.Router();

    router.post(
        "/login",
        authRateLimiter,
        validate({ body: loginSchema }),
        asyncHandler(async (req, res) => {
            const response = await authService.login(req.body.email, req.body.password, {
                ip: req.clientIp,
                userAgent: req.headers["user-agent"] || ""
            });
            res.status(200).json(response);
        })
    );

    router.get(
        "/me",
        authenticationMiddleware(authService),
        asyncHandler(async (req, res) => {
            const profile = await authService.getProfile(req.user.id);
            res.status(200).json(profile);
        })
    );

    return router;
}

module.exports = {
    createAuthRouter
};
