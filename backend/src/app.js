const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const pinoHttp = require("pino-http");

const { FileDatabase } = require("./infrastructure/persistence/file-database");
const { ProjectsRepository } = require("./infrastructure/persistence/repositories/projects.repository");
const { ContactsRepository } = require("./infrastructure/persistence/repositories/contacts.repository");
const { UsersRepository } = require("./infrastructure/persistence/repositories/users.repository");
const { InMemoryCache } = require("./infrastructure/cache/in-memory-cache");
const { createMetricsStore } = require("./infrastructure/monitoring/metrics-store");

const { AuthService } = require("./application/auth/auth.service");
const { ProjectsService } = require("./application/projects/projects.service");
const { ContactsService } = require("./application/contacts/contacts.service");
const { SystemService } = require("./application/system.service");

const { createAuthRouter } = require("./interfaces/http/routes/auth.routes");
const { createProjectsRouter } = require("./interfaces/http/routes/projects.routes");
const { createContactsRouter } = require("./interfaces/http/routes/contacts.routes");
const { createSystemRouter } = require("./interfaces/http/routes/system.routes");

const { requestContextMiddleware } = require("./interfaces/http/middlewares/request-context.middleware");
const { requestMetricsMiddleware } = require("./interfaces/http/middlewares/request-metrics.middleware");
const {
    createGeneralRateLimiter,
    createAuthRateLimiter,
    createContactRateLimiter
} = require("./interfaces/http/middlewares/rate-limit.middleware");
const { authenticationMiddleware, authorizeRoles } = require("./interfaces/http/middlewares/auth.middleware");
const { csrfOriginGuard } = require("./interfaces/http/middlewares/csrf-origin.middleware");
const { notFoundMiddleware, errorMiddleware } = require("./interfaces/http/middlewares/error.middleware");
const { AppError } = require("./common/errors");

const OPEN_API_SPEC = {
    openapi: "3.0.3",
    info: {
        title: "Portfolio Integrado Backend API",
        version: "1.0.0",
        description: "API versionada para gerenciamento de projetos, contatos e observabilidade do portfolio."
    },
    servers: [{ url: "/api/v1" }],
    paths: {
        "/health": {
            get: {
                summary: "Health check (atalho)",
                description: "Atalho para /system/health"
            }
        },
        "/system/health": {
            get: {
                summary: "Health check"
            }
        },
        "/auth/login": {
            post: {
                summary: "Autentica admin e retorna JWT"
            }
        },
        "/projects": {
            get: {
                summary: "Lista projetos"
            },
            post: {
                summary: "Cria projeto (admin)"
            }
        },
        "/contacts": {
            post: {
                summary: "Registra contato publico"
            },
            get: {
                summary: "Lista contatos (admin)"
            }
        }
    }
};

async function buildApp({ config, logger }) {
    const database = new FileDatabase(config.dataFile, {
        projects: [],
        contacts: [],
        users: []
    });

    await database.ensure();

    const projectsRepository = new ProjectsRepository(database);
    const contactsRepository = new ContactsRepository(database);
    const usersRepository = new UsersRepository(database);

    const cache = new InMemoryCache();
    const metricsStore = createMetricsStore();

    const authService = new AuthService({ usersRepository, config });
    const projectsService = new ProjectsService({ projectsRepository, cache });
    const contactsService = new ContactsService({ contactsRepository, metricsStore });
    const systemService = new SystemService({ metricsStore, config });

    await authService.ensureAdminUser();

    const app = express();

    if (config.trustProxy) {
        app.set("trust proxy", 1);
    }

    const corsOptions = {
        origin(origin, callback) {
            if (!origin || !config.corsOrigins.length || config.corsOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new AppError("Origem nao permitida.", 403, "ORIGIN_NOT_ALLOWED"));
        },
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: false
    };

    app.use(requestContextMiddleware);
    app.use(
        pinoHttp({
            logger,
            customProps: req => ({ requestId: req.requestId })
        })
    );
    app.use(requestMetricsMiddleware(metricsStore));
    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(compression());
    app.use(hpp());
    app.use(express.json({ limit: "100kb" }));
    app.use(express.urlencoded({ extended: false, limit: "50kb" }));
    app.use(csrfOriginGuard(config));
    app.use(createGeneralRateLimiter(config));

    const api = express.Router();

    api.get("/health", (_req, res) => {
        res.status(200).json(systemService.getHealth());
    });

    api.get("/docs/openapi.json", (_req, res) => {
        res.status(200).json(OPEN_API_SPEC);
    });

    api.use("/auth", createAuthRouter({ authService, authRateLimiter: createAuthRateLimiter() }));
    api.use("/projects", createProjectsRouter({ projectsService, authService }));
    api.use(
        "/contacts",
        createContactsRouter({
            contactsService,
            authService,
            contactRateLimiter: createContactRateLimiter()
        })
    );
    api.use(
        "/system",
        createSystemRouter({
            systemService,
            authService,
            authenticationMiddleware,
            authorizeRoles
        })
    );

    app.use(config.apiPrefix, api);

    app.use(notFoundMiddleware);
    app.use(errorMiddleware({ logger, config }));

    return {
        app,
        services: {
            authService,
            projectsService,
            contactsService,
            systemService
        },
        metricsStore
    };
}

module.exports = {
    buildApp,
    OPEN_API_SPEC
};
