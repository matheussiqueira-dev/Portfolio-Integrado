# Portfolio Integrado - Fullstack Platform

Plataforma fullstack para apresentar portfolio profissional com foco em descoberta de projetos, analise tecnica, captura de oportunidades comerciais e operacao segura de backend.

## Visao Geral

O projeto foi estruturado para atender tres objetivos de negocio:

- Exibir projetos com curadoria tecnica, filtros e narrativa de impacto.
- Aumentar conversao de contatos com fluxo resiliente (validacao, idempotencia e fallback).
- Demonstrar maturidade de engenharia com frontend moderno, API versionada e observabilidade.

Publico-alvo:

- recrutadores e liderancas tecnicas;
- clientes que buscam consultoria/projetos;
- equipes interessadas no padrao arquitetural adotado.

## Arquitetura e Decisoes Tecnicas

Arquitetura geral:

- `frontend`: SPA leve em HTML/CSS/JS modularizado por responsabilidades no `script.js`.
- `backend`: monolito modular em Node.js/Express com camadas `application`, `infrastructure`, `interfaces/http`.
- `data`: persistencia JSON com escrita atomica para simplicidade e baixo custo operacional.

Principais decisoes:

- API versionada em `/api/v1` para evolucao de contratos sem quebra.
- Validacao de entrada com `zod` em todas as rotas HTTP.
- Seguranca por camadas: `helmet`, `hpp`, `cors`, rate-limit, JWT com issuer e lockout de login.
- Cache in-memory com TTL e limite de entradas para endpoints publicos de leitura.
- Separacao de responsabilidades por services e repositories para manutenibilidade e testes.

## Stack e Tecnologias

Frontend:

- HTML5 semantico
- CSS com design tokens e responsividade mobile-first
- JavaScript moderno (ES modules)
- Vite (dev/build/preview)

Backend:

- Node.js 18+
- Express 4
- Zod
- JWT (`jsonwebtoken`) + `bcryptjs`
- `helmet`, `cors`, `hpp`, `express-rate-limit`, `compression`
- `pino` e `pino-http`
- Testes com `node:test` + `supertest`

## Funcionalidades Principais

Frontend:

- UI/UX redesenhada com hierarquia visual moderna e acessivel.
- Explorador de projetos com busca, tag, ordenacao, favoritos, exportacao e compartilhamento de filtros.
- Modal de detalhes com foco acessivel e historico de visualizacao recente.
- Assistente de recomendacoes por interesse/contexto com fallback local resiliente.
- Formulario com validacao, contador, rascunho local e envio idempotente para API.

Backend:

- Autenticacao admin com JWT + lockout por tentativas invalidas.
- CRUD de projetos com filtros, insights, taxonomia de tags e recomendacoes inteligentes.
- Captura de contatos com anti-spam, deduplicacao temporal e `Idempotency-Key`.
- Operacao de contatos com status, historico e endpoint de resumo operacional.
- Health/readiness checks e metricas de runtime para observabilidade.

## Novas Features Implementadas Nesta Evolucao

1. Recomendacao inteligente de projetos:

- Endpoint `GET /api/v1/projects/recommendations` com ranking por interesse e contexto.
- Consumo no frontend via painel de descoberta guiada.
- Fallback local para manter experiencia mesmo com API indisponivel.

2. Resumo operacional de contatos:

- Endpoint admin `GET /api/v1/contacts/summary`.
- Retorna total, taxa de resolucao, distribuicao por status/fonte e volume diario.

3. Confiabilidade no formulario de contato:

- envio com `Idempotency-Key` no cliente;
- rascunho automatico em `localStorage` para evitar perda de conversao.

## Estrutura do Projeto

```text
.
├── backend/
│   ├── data/
│   ├── src/
│   │   ├── application/
│   │   ├── common/
│   │   ├── config/
│   │   ├── infrastructure/
│   │   └── interfaces/http/
│   └── tests/
├── index.html
├── style.css
├── script.js
├── package.json
└── README.md
```

## Setup e Execucao

### Pre-requisitos

- Node.js >= 18
- npm >= 9

### 1. Instalar dependencias do frontend

```bash
npm install
```

### 2. Instalar dependencias do backend

```bash
cd backend
npm install
```

### 3. Configurar ambiente do backend

```bash
cp .env.example .env
```

Variaveis relevantes:

- `PORT`
- `API_PREFIX`
- `DATA_FILE`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_ISSUER`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CORS_ORIGINS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `LOGIN_MAX_ATTEMPTS`
- `LOGIN_LOCK_WINDOW_MS`
- `CACHE_MAX_ENTRIES`

### 4. Rodar backend

```bash
cd backend
npm run dev
```

### 5. Rodar frontend

```bash
npm run dev
```

Frontend local: `http://localhost:4173`

### 6. Build de producao (frontend)

```bash
npm run build
npm run preview
```

## API - Endpoints Relevantes

Publicos:

- `GET /api/v1/health`
- `GET /api/v1/ready`
- `GET /api/v1/projects`
- `GET /api/v1/projects/:id`
- `GET /api/v1/projects/insights`
- `GET /api/v1/projects/tags`
- `GET /api/v1/projects/recommendations`
- `POST /api/v1/contacts`

Admin:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/projects`
- `PATCH /api/v1/projects/:id`
- `DELETE /api/v1/projects/:id`
- `GET /api/v1/contacts`
- `GET /api/v1/contacts/summary`
- `GET /api/v1/contacts/:id`
- `PATCH /api/v1/contacts/:id/status`
- `GET /api/v1/system/metrics`

Contrato OpenAPI (json):

- `GET /api/v1/docs/openapi.json`

## Testes e Qualidade

Backend:

```bash
cd backend
npm test
```

Cenarios cobertos:

- autenticacao e lockout;
- criacao/listagem de projetos;
- insights/tags/recomendacoes;
- captura de contatos, idempotencia e bloqueio de duplicidade;
- fluxo administrativo de triagem e resumo operacional.

## Deploy

Sugestao de estrategia:

- frontend em CDN estatico (Vercel/Netlify/GitHub Pages);
- backend em ambiente Node (Render/Fly/VM);
- variaveis sensiveis via secret manager;
- logs centralizados e monitoramento de uptime.

## Boas Praticas Adotadas

- SRP, DRY e separacao por camadas.
- Validacao de contratos na borda HTTP.
- Erros padronizados com `requestId` para rastreabilidade.
- Headers de seguranca e politicas de rate-limit por contexto.
- Acessibilidade: skip-link, foco visivel, navegação por teclado e `aria-live`.
- UI responsiva e otimizada para desktop e mobile.

## Melhorias Futuras

- Migrar persistencia para PostgreSQL + migrations.
- Adicionar painel administrativo dedicado para contatos/projetos.
- Introduzir refresh tokens e revogacao de sessoes.
- Expandir testes E2E frontend.
- Integrar tracing distribuido (OpenTelemetry).

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/