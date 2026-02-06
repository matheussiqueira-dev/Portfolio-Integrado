# Portfolio Integrado - Backend

API backend do Portfolio Integrado, projetada para gerenciar projetos, contatos e observabilidade operacional com foco em segurança, escalabilidade e manutenção em produção.

## Visão Geral do Backend

O backend atende dois domínios principais:

- `Projetos`: catálogo de projetos com status (`draft`/`published`) e exploração pública.
- `Contatos`: captura de leads públicos e fluxo administrativo de triagem.

Fluxos críticos:

1. cliente consulta projetos publicados e insights.
2. visitante envia contato com validação e proteções anti-spam.
3. administrador autentica via JWT e gerencia projetos/contatos.
4. operação acompanha saúde, readiness e métricas da API.

## Arquitetura Adotada

Arquitetura modular em camadas (monolito modular), inspirada em Clean Architecture:

- `application`: regras de negócio e casos de uso.
- `infrastructure`: persistência, cache, monitoramento e segurança técnica.
- `interfaces/http`: contratos, rotas e middlewares.
- `common/config`: utilitários, erros, logging e configuração.

Padrões aplicados:

- SRP e separação de responsabilidades.
- DRY em validação, erro e middlewares.
- composição por injeção de dependências no bootstrap (`buildApp`).

## Melhorias Técnicas Implementadas

### Segurança e Confiabilidade

- lockout de autenticação por tentativas inválidas (`AUTH_LOCKED`).
- JWT com `issuer` e validação consistente no `verify`.
- `Retry-After` automático para respostas de bloqueio.
- rate limits com handlers padronizados por contexto (geral, auth, contato).
- validação robusta com `safeParse` (Zod) e payload de erro consistente.
- idempotência em criação de contato via header `Idempotency-Key`.
- proteção anti-spam por duplicidade de mensagem em janela temporal.

### Performance e Escalabilidade

- cache in-memory com limite máximo de entradas e política de evicção.
- retorno de cache com `structuredClone` para evitar mutação externa.
- cache HTTP em endpoints públicos de leitura.
- endpoint de taxonomia de tags para reduzir agregações no cliente.

### Operação e Observabilidade

- readiness check (`/system/readiness`) com verificação de storage.
- métricas expandidas: p95/p99, distribuição por método/status, taxa de erro.
- request context com `requestId` e IP normalizado.

## Novas Features de API

- `GET /api/v1/projects/tags`: distribuição de tags dos projetos.
- `GET /api/v1/system/readiness`: prontidão de dependências.
- `GET /api/v1/contacts/:id` (admin): consulta detalhada de contato.
- `PATCH /api/v1/contacts/:id/status` com `internalNote` e `statusHistory`.
- `POST /api/v1/contacts` com suporte a idempotência (`Idempotency-Key`).

## Endpoints Principais

Base URL: `/api/v1`

- `GET /health`
- `GET /system/health`
- `GET /system/readiness`
- `GET /system/metrics` (admin)
- `POST /auth/login`
- `GET /auth/me` (auth)
- `GET /projects`
- `GET /projects/:id`
- `GET /projects/insights`
- `GET /projects/tags`
- `POST /projects` (admin)
- `PATCH /projects/:id` (admin)
- `DELETE /projects/:id` (admin)
- `POST /contacts`
- `GET /contacts` (admin)
- `GET /contacts/:id` (admin)
- `PATCH /contacts/:id/status` (admin)

## Tecnologias Utilizadas

- Node.js 18+
- Express 4
- Zod
- JWT (`jsonwebtoken`)
- `bcryptjs`
- `helmet`, `cors`, `hpp`, `express-rate-limit`, `compression`
- `pino`, `pino-http`
- persistência em arquivo JSON com escrita atômica
- testes com `node:test` + `supertest`

## Setup e Execução

### 1. Instalação

```bash
cd backend
npm install
```

### 2. Configuração

```bash
cp .env.example .env
```

Variáveis relevantes (novas):

- `JWT_ISSUER`
- `LOGIN_MAX_ATTEMPTS`
- `LOGIN_LOCK_WINDOW_MS`
- `CACHE_MAX_ENTRIES`

### 3. Desenvolvimento

```bash
npm run dev
```

### 4. Produção

```bash
npm start
```

### 5. Testes

```bash
npm test
```

## Estrutura do Projeto

```text
backend/
├── data/
├── src/
│   ├── application/
│   ├── common/
│   ├── config/
│   ├── infrastructure/
│   │   ├── cache/
│   │   ├── monitoring/
│   │   ├── persistence/
│   │   └── security/
│   ├── interfaces/
│   │   └── http/
│   │       ├── middlewares/
│   │       ├── routes/
│   │       └── schemas/
│   ├── app.js
│   └── server.js
├── tests/
├── .env.example
└── package.json
```

## Boas Práticas e Padrões

- API versionada e contratos consistentes.
- tratamento centralizado de erros com códigos padronizados.
- middlewares reutilizáveis para segurança/observabilidade.
- regras de negócio isoladas em services.
- repositórios desacoplados da camada HTTP.
- cobertura de testes para fluxos críticos e novas features.

## Melhorias Futuras

- migração de persistência para PostgreSQL com migrations.
- refresh tokens com rotação/revogação.
- RBAC mais granular por escopo.
- tracing distribuído (OpenTelemetry).
- testes de carga e hardening contínuo de segurança.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
