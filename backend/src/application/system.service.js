class SystemService {
    constructor({ metricsStore, config }) {
        this.metricsStore = metricsStore;
        this.config = config;
    }

    getHealth() {
        return {
            status: "ok",
            environment: this.config.env,
            timestamp: new Date().toISOString()
        };
    }

    getMetrics() {
        return this.metricsStore.snapshot();
    }
}

module.exports = {
    SystemService
};
