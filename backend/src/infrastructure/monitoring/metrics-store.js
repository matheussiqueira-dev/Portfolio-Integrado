function createMetricsStore() {
    const MAX_RESPONSE_SAMPLES = 2000;

    const state = {
        startedAt: Date.now(),
        requestsTotal: 0,
        byStatus: {},
        byMethod: {},
        byRoute: {},
        totalResponseTimeMs: 0,
        contactsCreated: 0,
        clientErrorsTotal: 0,
        serverErrorsTotal: 0,
        responseTimeSamplesMs: []
    };

    return {
        recordRequest(routeKey, statusCode, durationMs) {
            state.requestsTotal += 1;
            state.totalResponseTimeMs += durationMs;

            const [method = "UNKNOWN"] = String(routeKey || "").split(" ");
            const statusKey = String(statusCode);
            state.byStatus[statusKey] = (state.byStatus[statusKey] || 0) + 1;
            state.byMethod[method] = (state.byMethod[method] || 0) + 1;
            state.byRoute[routeKey] = (state.byRoute[routeKey] || 0) + 1;

            if (statusCode >= 500) {
                state.serverErrorsTotal += 1;
            } else if (statusCode >= 400) {
                state.clientErrorsTotal += 1;
            }

            if (Number.isFinite(durationMs) && durationMs >= 0) {
                state.responseTimeSamplesMs.push(durationMs);
                if (state.responseTimeSamplesMs.length > MAX_RESPONSE_SAMPLES) {
                    state.responseTimeSamplesMs.shift();
                }
            }
        },
        incrementContactsCreated() {
            state.contactsCreated += 1;
        },
        snapshot() {
            const percentile95 = calculatePercentile(state.responseTimeSamplesMs, 95);
            const percentile99 = calculatePercentile(state.responseTimeSamplesMs, 99);

            return {
                uptimeSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
                requestsTotal: state.requestsTotal,
                byStatus: state.byStatus,
                byMethod: state.byMethod,
                byRoute: state.byRoute,
                averageResponseTimeMs: state.requestsTotal
                    ? Number((state.totalResponseTimeMs / state.requestsTotal).toFixed(2))
                    : 0,
                responseTimeP95Ms: percentile95,
                responseTimeP99Ms: percentile99,
                clientErrorsTotal: state.clientErrorsTotal,
                serverErrorsTotal: state.serverErrorsTotal,
                errorRatePercent: state.requestsTotal
                    ? Number((((state.clientErrorsTotal + state.serverErrorsTotal) / state.requestsTotal) * 100).toFixed(2))
                    : 0,
                contactsCreated: state.contactsCreated,
                memoryUsage: process.memoryUsage()
            };
        }
    };
}

function calculatePercentile(samples, percentile) {
    if (!samples.length) {
        return 0;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const rank = Math.ceil((percentile / 100) * sorted.length) - 1;
    const value = sorted[Math.max(rank, 0)];
    return Number(value.toFixed(2));
}

module.exports = {
    createMetricsStore
};
