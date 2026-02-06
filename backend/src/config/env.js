const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config();

function toBoolean(value, defaultValue = false) {
    if (value === undefined) return defaultValue;
    return String(value).toLowerCase() === "true";
}

function toNumber(value, defaultValue) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
}

function getConfig(overrides = {}) {
    const cwd = path.resolve(__dirname, "..", "..");
    const dataFileFromEnv = process.env.DATA_FILE || "./data/db.json";

    const config = {
        env: process.env.NODE_ENV || "development",
        isProduction: (process.env.NODE_ENV || "development") === "production",
        port: toNumber(process.env.PORT, 3000),
        apiPrefix: process.env.API_PREFIX || "/api/v1",
        dataFile: path.resolve(cwd, dataFileFromEnv),
        jwtSecret: process.env.JWT_SECRET || "change-me-super-secret",
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30m",
        jwtIssuer: process.env.JWT_ISSUER || "portfolio-integrado-api",
        adminEmail: process.env.ADMIN_EMAIL || "admin@portfolio.local",
        adminPassword: process.env.ADMIN_PASSWORD || "ChangeMe123!",
        corsOrigins: (process.env.CORS_ORIGINS || "")
            .split(",")
            .map(item => item.trim())
            .filter(Boolean),
        rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
        rateLimitMax: toNumber(process.env.RATE_LIMIT_MAX, 120),
        trustProxy: toBoolean(process.env.TRUST_PROXY, false),
        loginMaxAttempts: toNumber(process.env.LOGIN_MAX_ATTEMPTS, 5),
        loginLockWindowMs: toNumber(process.env.LOGIN_LOCK_WINDOW_MS, 10 * 60 * 1000),
        cacheMaxEntries: toNumber(process.env.CACHE_MAX_ENTRIES, 500)
    };

    const merged = { ...config, ...overrides };
    validateProductionSecurity(merged);
    return merged;
}

function validateProductionSecurity(config) {
    if (!config.isProduction) {
        return;
    }

    if (!config.jwtSecret || config.jwtSecret === "change-me-super-secret") {
        throw new Error("JWT_SECRET inseguro para ambiente de producao.");
    }

    if (!config.adminPassword || config.adminPassword.length < 10) {
        throw new Error("ADMIN_PASSWORD deve ter ao menos 10 caracteres em producao.");
    }

    if (!config.jwtIssuer || String(config.jwtIssuer).length < 3) {
        throw new Error("JWT_ISSUER invalido para ambiente de producao.");
    }
}

module.exports = {
    getConfig
};
