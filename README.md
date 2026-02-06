# Portfolio Integrado

Portfolio profissional full stack com frontend moderno e backend API seguro para exibicao de projetos, insights tecnicos e captura de contatos.

## Visao Geral do Projeto

O projeto foi desenhado para apresentar a marca profissional de forma escalavel, com foco em tres objetivos:

- comunicar autoridade tecnica (software, dados e UX)
- facilitar descoberta de projetos por recrutadores e clientes
- converter visitas em contatos qualificados

Publico-alvo principal:

- recrutadores tecnicos
- gestores de produto e tecnologia
- clientes que precisam de desenvolvimento sob medida

Fluxo principal da aplicacao:

1. usuario navega pela home e entende posicionamento profissional
2. usuario explora projetos por busca, categoria, ordenacao e favoritos
3. usuario consulta insights agregados de stack e historico de entregas
4. usuario envia contato via API (com fallback por email)

## Analise Tecnica e Melhorias Aplicadas

Principais pontos identificados na analise inicial:

- frontend com dados estaticos e pouca integracao real com backend
- experiencia de exploracao de projetos ainda limitada para tomada de decisao
- necessidade de evoluir observabilidade e protecoes anti-spam no backend
- oportunidades de elevar consistencia visual e hierarquia de informacao

Melhorias executadas nesta entrega:

- refactor completo de UI/UX com nova arquitetura visual, layout responsivo e acessibilidade
- frontend com consumo dinamico da API (`/projects` e `/projects/insights`) + fallback local resiliente
- novo endpoint analitico de projetos para apoiar narrativa orientada a dados
- protecao anti-spam com bloqueio de contatos duplicados em curto intervalo
- enriquecimento de metricas operacionais (metodos, erros, p95/p99)
- cache HTTP para rotas publicas de projetos
- validacoes e hardening de configuracao para ambiente de producao
- ampliacao da cobertura de testes da API

## Tecnologias Utilizadas

### Frontend

- HTML5 semantico
- CSS3 com design tokens e tema claro/escuro
- JavaScript (ES2020+)
- Integracao com API REST

### Backend

- Node.js
- Express
- Zod (validacao de contratos)
- JWT + bcryptjs (autenticacao)
- Helmet, CORS, HPP, rate-limit, compression
- Pino / Pino HTTP (observabilidade)
- Persistencia em arquivo JSON com escrita atomica

### Qualidade e Testes

- node:test
- supertest

## Funcionalidades Principais

- explorador de projetos com busca, filtros e ordenacao
- favoritos persistentes em `localStorage`
- modal de detalhes de projeto com foco em legibilidade tecnica
- dashboard de insights (categorias, stacks e distribuicao temporal)
- status de conectividade com API em tempo real
- formulario de contato com validacao de campos e fallback para `mailto`
- endpoint de insights: `GET /api/v1/projects/insights`
- bloqueio de contato duplicado recente (`DUPLICATE_CONTACT`)
- metricas operacionais com latencia p95/p99

## Instalacao e Uso

### Pre-requisitos

- Node.js 18+
- npm 9+

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API padrao: `http://localhost:3000/api/v1`

### 2) Frontend

Opcao simples (modo local com fallback):

- abra `index.html` no navegador

Opcao recomendada (com backend ativo):

- sirva a raiz do projeto com servidor estatico (ex.: `npx serve .`)
- mantenha o backend rodando
- ajuste `<meta name="portfolio-api-base" ...>` em `index.html` se a API estiver em outro host

### 3) Testes

```bash
cd backend
npm test
```

## Estrutura do Projeto

```text
Portfolio-Integrado-main/
├── index.html
├── style.css
├── script.js
├── backend/
│   ├── src/
│   │   ├── application/
│   │   ├── common/
│   │   ├── config/
│   │   ├── infrastructure/
│   │   └── interfaces/http/
│   ├── data/
│   ├── tests/
│   └── package.json
└── README.md
```

## Boas Praticas Adotadas

- separacao por camadas no backend (servicos, repositorios, interfaces)
- validacao de entrada em body/query/params
- tratamento centralizado de erros com codigos padronizados
- principio de fallback para preservar disponibilidade do frontend
- estrategia de cache para reduzir latencia em consultas publicas
- componentes de UI com foco em contraste, navegacao por teclado e feedback de estado
- estado de UI previsivel e atualizacao declarativa no frontend

## Possiveis Melhorias Futuras

- migracao de persistencia para PostgreSQL com migrations
- painel administrativo autenticado para gerenciar projetos e contatos
- CI/CD com lint, testes e deploy automatizado
- instrumentacao OpenTelemetry + dashboard de observabilidade
- internacionalizacao (pt/en) com detecao de idioma
- testes E2E para fluxos criticos do frontend

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
