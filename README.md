# Portfolio Integrado - Backend API

Backend do Portfolio Integrado, projetado para expor dados de projetos, registrar contatos e oferecer recursos administrativos com foco em seguranca, observabilidade e manutencao.

## Visao Geral do Backend

Este backend atende ao dominio de portfolio profissional com duas frentes principais:

- Camada publica: listagem de projetos e recebimento de contatos
- Camada administrativa: autenticacao, gestao de projetos, gestao de contatos e metricas operacionais

## Dominio e Regras de Negocio

### Projetos

- Projetos possuem ciclo de vida (`draft` e `published`)
- Apenas projetos `published` sao expostos no fluxo publico
- Gestao completa (CRUD) restrita ao perfil `admin`

### Contatos

- Mensagens publicas sao registradas com status inicial `new`
- Status evolui para `in_progress` ou `resolved` no fluxo administrativo
- Endpoint publico possui protecoes anti-spam (rate limit + honeypot)

### Usuarios

- Usuario administrador e provisionado automaticamente no bootstrap
- Login retorna JWT com papel (`role`) para autorizacao baseada em permissoes

## Arquitetura Adotada

Arquitetura em **Monolito Modular** com separacao por camadas inspirada em Clean Architecture:

- `application`: casos de uso e regras de negocio
- `domain`: modelos de dominio
- `infrastructure`: persistencia, cache e metricas
- `interfaces/http`: rotas, middlewares, schemas e contratos de API

Padroes aplicados:

- SRP e separacao clara de responsabilidades
- DRY em validacao, tratamento de erros e middlewares
- Composicao de servicos por injecao de dependencias no bootstrap

## Tecnologias Utilizadas

- Node.js
- Express 4
- Zod (validacao)
- JWT (`jsonwebtoken`) para autenticacao
- `bcryptjs` para hash de senha
- `helmet`, `cors`, `hpp`, `express-rate-limit`, `compression`
- `pino` e `pino-http` para logging estruturado
- Persistencia em arquivo JSON com escrita atomica
- Testes com `node:test` + `supertest`

## Seguranca e Confiabilidade

Implementado no backend:

- Autenticacao JWT (`Bearer token`)
- Autorizacao por role (`admin`)
- Validacao de payload com Zod em body/query/params
- Protecao contra ataques comuns:
  - XSS: sanitizacao de campos textuais de entrada
  - CSRF: guard de `Origin` para metodos mutaveis
  - SQLi: bloqueio de payload suspeito e ausencia de camada SQL dinamica
- Rate limiting global, especifico para login e para contato
- Headers de seguranca com Helmet
- `x-request-id` por requisicao
- Tratamento centralizado de excecoes com codigo padrao de erro
- Graceful shutdown e handlers de `unhandledRejection`/`uncaughtException`

## API e Contratos

Prefixo versionado: ` /api/v1 `

### Endpoints principais

- `GET /api/v1/health`
- `GET /api/v1/system/health`
- `GET /api/v1/docs/openapi.json`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (auth)
- `GET /api/v1/projects`
- `GET /api/v1/projects/:id`
- `POST /api/v1/projects` (admin)
- `PATCH /api/v1/projects/:id` (admin)
- `DELETE /api/v1/projects/:id` (admin)
- `POST /api/v1/contacts`
- `GET /api/v1/contacts` (admin)
- `PATCH /api/v1/contacts/:id/status` (admin)
- `GET /api/v1/system/metrics` (admin)

### Exemplo rapido de login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.local","password":"ChangeMe123!"}'
```

## Setup e Execucao

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

### 4. Rodar testes

```bash
npm test
```

## Estrutura do Projeto

```text
backend/
├── data/
│   └── db.json
├── src/
│   ├── application/
│   ├── bootstrap/
│   ├── common/
│   ├── config/
│   ├── domain/
│   ├── infrastructure/
│   │   ├── cache/
│   │   ├── monitoring/
│   │   └── persistence/
│   ├── interfaces/
│   │   └── http/
│   │       ├── middlewares/
│   │       ├── routes/
│   │       └── schemas/
│   ├── app.js
│   └── server.js
├── tests/
├── .env.example
├── .gitignore
└── package.json
```

## Boas Praticas e Padroes Aplicados

- API versionada e contrato OpenAPI
- Tratamento de erro padronizado e observavel
- Middlewares reutilizaveis
- Regras de negocio encapsuladas em services
- Persistencia isolada por repositorios
- Testes de integracao cobrindo fluxos criticos

## Melhorias Futuras

- Migrar persistencia para PostgreSQL com migrations
- Implementar refresh token com revogacao
- Adicionar RBAC granular por escopo
- Adicionar filas para processamento assíncrono de contatos
- Integrar tracing distribuido e APM
- Implementar testes de carga e chaos engineering

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
