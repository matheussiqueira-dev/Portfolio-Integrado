const { randomUUID } = require("node:crypto");

function requestContextMiddleware(req, res, next) {
    const requestId = req.headers["x-request-id"] || randomUUID();
    req.requestId = String(requestId);
    req.clientIp = req.ip || req.socket?.remoteAddress || "unknown";
    res.setHeader("x-request-id", req.requestId);
    next();
}

module.exports = {
    requestContextMiddleware
};
