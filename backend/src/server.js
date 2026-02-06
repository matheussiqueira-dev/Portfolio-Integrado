const { createServer } = require("node:http");

const { getConfig } = require("./config/env");
const { createLogger } = require("./common/logger");
const { buildApp } = require("./app");

async function bootstrap() {
    const config = getConfig();
    const logger = createLogger(config);

    const { app } = await buildApp({ config, logger });
    const server = createServer(app);

    server.listen(config.port, () => {
        logger.info({ port: config.port, apiPrefix: config.apiPrefix }, "Backend online");
    });

    const shutdown = signal => {
        logger.info({ signal }, "Iniciando encerramento gracioso");
        server.close(() => {
            logger.info("Servidor encerrado");
            process.exit(0);
        });

        setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("unhandledRejection", error => {
        logger.error({ error }, "Unhandled rejection");
    });

    process.on("uncaughtException", error => {
        logger.fatal({ error }, "Uncaught exception");
        process.exit(1);
    });
}

bootstrap();
