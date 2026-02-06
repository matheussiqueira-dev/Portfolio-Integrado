const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createTestContext, TEST_CONFIG } = require("./test-setup");

const TEST_DB = TEST_CONFIG.dataFile;

async function resetTestDatabase() {
    await fs.mkdir(path.dirname(TEST_DB), { recursive: true });
    await fs.writeFile(
        TEST_DB,
        JSON.stringify({ projects: [], contacts: [], users: [] }, null, 2),
        "utf8"
    );
}

test.beforeEach(async () => {
    await resetTestDatabase();
});

test("GET /api/v1/system/health retorna 200", async () => {
    const { app } = await createTestContext();

    const response = await request(app).get("/api/v1/system/health");

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "ok");
});

test("GET /api/v1/system/readiness retorna 200 quando dependencias estao prontas", async () => {
    const { app } = await createTestContext();

    const response = await request(app).get("/api/v1/system/readiness");

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "ready");
});

test("POST /api/v1/auth/login retorna token para credencial valida", async () => {
    const { app } = await createTestContext();

    const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_CONFIG.adminEmail, password: TEST_CONFIG.adminPassword });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body.accessToken);
    assert.equal(response.body.user.role, "admin");
});

test("POST /api/v1/auth/login aplica lockout apos repetidas tentativas invalidas", async () => {
    const { app } = await createTestContext();

    for (let attempt = 1; attempt <= 4; attempt += 1) {
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: TEST_CONFIG.adminEmail, password: "SenhaErrada123!" });

        assert.equal(response.statusCode, 401);
        assert.equal(response.body.error.code, "INVALID_CREDENTIALS");
    }

    const locked = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_CONFIG.adminEmail, password: "SenhaErrada123!" });

    assert.equal(locked.statusCode, 429);
    assert.equal(locked.body.error.code, "AUTH_LOCKED");

    const blockedValid = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_CONFIG.adminEmail, password: TEST_CONFIG.adminPassword });

    assert.equal(blockedValid.statusCode, 429);
    assert.equal(blockedValid.body.error.code, "AUTH_LOCKED");
});

test("POST /api/v1/projects exige autenticacao", async () => {
    const { app } = await createTestContext();

    const response = await request(app).post("/api/v1/projects").send({
        title: "Projeto API",
        summary: "Resumo valido com mais de dez caracteres.",
        impact: "Impacto tecnico e de negocio detalhado para teste.",
        year: 2026,
        tags: ["backend"],
        stack: ["Node.js"],
        status: "published"
    });

    assert.equal(response.statusCode, 401);
});

test("ciclo de criacao e leitura de projeto com JWT admin", async () => {
    const { app } = await createTestContext();

    const login = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_CONFIG.adminEmail, password: TEST_CONFIG.adminPassword });

    const token = login.body.accessToken;

    const created = await request(app)
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "API de Portfolio",
            summary: "API robusta com validacao, seguranca e observabilidade.",
            impact: "Padroniza operacao de conteudo e melhora escalabilidade.",
            year: 2026,
            tags: ["backend", "dados"],
            stack: ["Express", "JWT"],
            status: "published"
        });

    assert.equal(created.statusCode, 201);
    assert.ok(created.body.id);

    const listed = await request(app).get("/api/v1/projects");
    assert.equal(listed.statusCode, 200);
    assert.equal(listed.body.items.length, 1);
});

test("POST /api/v1/contacts registra contato publico", async () => {
    const { app } = await createTestContext();

    const response = await request(app).post("/api/v1/contacts").send({
        name: "Cliente Teste",
        email: "cliente@empresa.com",
        subject: "Projeto backend",
        message: "Gostaria de discutir uma implementacao backend com foco em API e seguranca.",
        source: "landing-page",
        website: ""
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.status, "new");
    assert.equal(response.body.deduplicated, false);
});

test("GET /api/v1/projects/insights retorna agregados", async () => {
    const { app } = await createTestContext();

    const login = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_CONFIG.adminEmail, password: TEST_CONFIG.adminPassword });

    const token = login.body.accessToken;

    await request(app)
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Portal de Dados",
            summary: "Projeto para consolidar indicadores de receita com dashboards interativos.",
            impact: "Reduziu tempo de leitura operacional em comites executivos.",
            year: 2026,
            tags: ["dados", "backend"],
            stack: ["Node.js", "SQL"],
            status: "published"
        });

    await request(app)
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Design System",
            summary: "Biblioteca de componentes para acelerar entregas frontend.",
            impact: "Aumentou consistencia visual e reduziu retrabalho de UI.",
            year: 2025,
            tags: ["frontend"],
            stack: ["HTML", "CSS"],
            status: "published"
        });

    const response = await request(app).get("/api/v1/projects/insights");

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.total, 2);
    assert.equal(response.body.byTag.dados, 1);
    assert.equal(response.body.byTag.frontend, 1);
    assert.equal(response.headers["cache-control"], "public, max-age=60, stale-while-revalidate=300");
});

test("POST /api/v1/contacts bloqueia mensagem duplicada em curto intervalo", async () => {
    const { app } = await createTestContext();

    const payload = {
        name: "Cliente Teste",
        email: "cliente@empresa.com",
        subject: "Projeto backend",
        message: "Gostaria de discutir uma implementacao backend com foco em API e seguranca.",
        source: "landing-page",
        website: ""
    };

    const created = await request(app).post("/api/v1/contacts").send(payload);
    assert.equal(created.statusCode, 201);

    const duplicate = await request(app).post("/api/v1/contacts").send(payload);
    assert.equal(duplicate.statusCode, 409);
    assert.equal(duplicate.body.error.code, "DUPLICATE_CONTACT");
});

test("POST /api/v1/contacts com Idempotency-Key evita duplicacao de escrita", async () => {
    const { app } = await createTestContext();

    const payload = {
        name: "Cliente Idempotente",
        email: "cliente.idempotente@empresa.com",
        subject: "Projeto backend",
        message: "Quero validar o comportamento idempotente para retries de requisicao.",
        source: "landing-page",
        website: ""
    };

    const first = await request(app)
        .post("/api/v1/contacts")
        .set("Idempotency-Key", "contato-backend-12345")
        .send(payload);

    assert.equal(first.statusCode, 201);
    assert.equal(first.body.deduplicated, false);

    const retry = await request(app)
        .post("/api/v1/contacts")
        .set("Idempotency-Key", "contato-backend-12345")
        .send(payload);

    assert.equal(retry.statusCode, 200);
    assert.equal(retry.body.deduplicated, true);
    assert.equal(retry.body.id, first.body.id);
});

test("GET/PATCH /api/v1/contacts/:id permite fluxo administrativo de triagem", async () => {
    const { app } = await createTestContext();

    const created = await request(app).post("/api/v1/contacts").send({
        name: "Cliente Operacao",
        email: "operacao@empresa.com",
        subject: "Suporte tecnico",
        message: "Precisamos evoluir a triagem de contatos com status detalhado.",
        source: "landing-page",
        website: ""
    });

    const contactId = created.body.id;

    const login = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_CONFIG.adminEmail, password: TEST_CONFIG.adminPassword });

    const token = login.body.accessToken;

    const updated = await request(app)
        .patch(`/api/v1/contacts/${contactId}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            status: "resolved",
            internalNote: "Contato tratado e encaminhado para proposta."
        });

    assert.equal(updated.statusCode, 200);
    assert.equal(updated.body.status, "resolved");
    assert.equal(updated.body.internalNote, "Contato tratado e encaminhado para proposta.");
    assert.equal(updated.body.statusHistory.length, 2);

    const fetched = await request(app)
        .get(`/api/v1/contacts/${contactId}`)
        .set("Authorization", `Bearer ${token}`);

    assert.equal(fetched.statusCode, 200);
    assert.equal(fetched.body.id, contactId);
    assert.equal(fetched.body.status, "resolved");
});

test("GET /api/v1/projects/tags retorna taxonomia agregada de tags", async () => {
    const { app } = await createTestContext();

    const login = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_CONFIG.adminEmail, password: TEST_CONFIG.adminPassword });

    const token = login.body.accessToken;

    await request(app)
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "API de Dados",
            summary: "Projeto para consolidar dados transacionais em dashboards.",
            impact: "Aumentou velocidade de decisao com dados confiaveis.",
            year: 2026,
            tags: ["dados", "backend"],
            stack: ["Node.js", "SQL"],
            status: "published"
        });

    await request(app)
        .post("/api/v1/projects")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Portal de Frontend",
            summary: "Projeto frontend com design system e acessibilidade.",
            impact: "Melhorou experiencia de usuario em canais digitais.",
            year: 2025,
            tags: ["frontend"],
            stack: ["HTML", "CSS"],
            status: "published"
        });

    const response = await request(app).get("/api/v1/projects/tags");

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.totalTags, 3);
    assert.equal(response.body.tags[0].tag, "backend");
    assert.equal(response.headers["cache-control"], "public, max-age=60, stale-while-revalidate=300");
});
