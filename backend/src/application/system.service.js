class SystemService {
    constructor({ metricsStore, config, database }) {
        this.metricsStore = metricsStore;
        this.config = config;
        this.database = database;
        this.startedAt = Date.now();
    }

    getHealth() {
        return {
            status: "ok",
            environment: this.config.env,
            uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
            timestamp: new Date().toISOString()
        };
    }

    getMetrics() {
        return this.metricsStore.snapshot();
    }

    async getReadiness() {
        const checks = [];

        try {
            await this.database.ping();
            checks.push({ name: "storage", status: "ok" });
        } catch (error) {
            checks.push({
                name: "storage",
                status: "error",
                reason: String(error.message || "Falha ao acessar persistencia")
            });
        }

        const hasFailures = checks.some(item => item.status !== "ok");
        return {
            status: hasFailures ? "degraded" : "ready",
            checks,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    SystemService
};
