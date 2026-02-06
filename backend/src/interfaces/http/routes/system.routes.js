const express = require("express");
const { asyncHandler } = require("../middlewares/async-handler.middleware");

function createSystemRouter({ systemService, authService, authenticationMiddleware, authorizeRoles }) {
    const router = express.Router();

    router.get("/health", (_req, res) => {
        res.status(200).json(systemService.getHealth());
    });

    router.get(
        "/metrics",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        asyncHandler(async (_req, res) => {
            res.status(200).json(systemService.getMetrics());
        })
    );

    return router;
}

module.exports = {
    createSystemRouter
};
