function createMetricsStore() {
    const state = {
        startedAt: Date.now(),
        requestsTotal: 0,
        byStatus: {},
        byRoute: {},
        totalResponseTimeMs: 0,
        contactsCreated: 0
    };

    return {
        recordRequest(routeKey, statusCode, durationMs) {
            state.requestsTotal += 1;
            state.totalResponseTimeMs += durationMs;

            const statusKey = String(statusCode);
            state.byStatus[statusKey] = (state.byStatus[statusKey] || 0) + 1;
            state.byRoute[routeKey] = (state.byRoute[routeKey] || 0) + 1;
        },
        incrementContactsCreated() {
            state.contactsCreated += 1;
        },
        snapshot() {
            return {
                uptimeSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
                requestsTotal: state.requestsTotal,
                byStatus: state.byStatus,
                byRoute: state.byRoute,
                averageResponseTimeMs: state.requestsTotal
                    ? Number((state.totalResponseTimeMs / state.requestsTotal).toFixed(2))
                    : 0,
                contactsCreated: state.contactsCreated,
                memoryUsage: process.memoryUsage()
            };
        }
    };
}

module.exports = {
    createMetricsStore
};
