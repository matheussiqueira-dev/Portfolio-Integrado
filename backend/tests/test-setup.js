const { getConfig } = require("../src/config/env");
const { createLogger } = require("../src/common/logger");
const { buildApp } = require("../src/app");

const TEST_CONFIG = getConfig({
    env: "test",
    isProduction: false,
    dataFile: require("node:path").resolve(__dirname, "..", "data", "test-db.json"),
    jwtSecret: "test-secret",
    adminEmail: "admin@test.local",
    adminPassword: "StrongPass123!",
    corsOrigins: ["http://localhost"],
    rateLimitMax: 1000
});

function createTestContext() {
    const logger = createLogger(TEST_CONFIG);
    return buildApp({ config: TEST_CONFIG, logger });
}

module.exports = {
    createTestContext,
    TEST_CONFIG
};
