function requestMetricsMiddleware(metricsStore) {
    return (req, res, next) => {
        const startedAt = process.hrtime.bigint();

        res.on("finish", () => {
            const endedAt = process.hrtime.bigint();
            const durationMs = Number(endedAt - startedAt) / 1_000_000;
            const routeKey = `${req.method} ${req.baseUrl || ""}${req.route?.path || req.path}`;

            metricsStore.recordRequest(routeKey, res.statusCode, durationMs);
        });

        next();
    };
}

module.exports = {
    requestMetricsMiddleware
};
