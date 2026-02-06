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

test("POST /api/v1/auth/login retorna token para credencial valida", async () => {
    const { app } = await createTestContext();

    const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_CONFIG.adminEmail, password: TEST_CONFIG.adminPassword });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body.accessToken);
    assert.equal(response.body.user.role, "admin");
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
});
