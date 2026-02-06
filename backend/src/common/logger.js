const pino = require("pino");

function createLogger(config) {
    return pino({
        level: config.isProduction ? "info" : "debug",
        base: null,
        timestamp: pino.stdTimeFunctions.isoTime
    });
}

module.exports = {
    createLogger
};
