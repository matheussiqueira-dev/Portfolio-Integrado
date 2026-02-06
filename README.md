# Portfolio Integrado - Frontend

Aplicacao frontend do portfolio profissional de Matheus Siqueira, com foco em descoberta de projetos, narrativa tecnica orientada a dados e conversao de contatos.

## Visao Geral do Frontend

O frontend foi estruturado para atender dois objetivos de negocio:

- fortalecer posicionamento profissional com uma experiencia visual premium
- facilitar navegacao, avaliacao tecnica e contato em poucos passos

Publico-alvo principal:

- recrutadores e liderancas de tecnologia
- clientes buscando desenvolvimento frontend/full stack

Fluxos centrais da experiencia:

1. entendimento do posicionamento e propostas de valor
2. exploracao de projetos por filtros, busca, ordenacao e favoritos
3. consumo de insights tecnicos agregados pela API
4. envio de contato com fallback resiliente para email

## Analise Tecnica Executada

Pontos analisados no frontend:

- arquitetura de estado e eventos da camada de interface
- custo de renderizacao e atualizacao do grid de projetos
- consistencia visual e componentes reutilizaveis
- acessibilidade (teclado, foco, semantica, feedbacks ARIA)
- SEO on-page e estruturacao de metadados
- responsividade em desktop/tablet/mobile

Decisoes de melhoria aplicadas:

- consolidacao de design tokens e componentes visuais consistentes
- sincronizacao de filtros com URL para compartilhamento de contexto
- adicao de recursos de produtividade no explorador (share/export/historico recente)
- melhorias de acessibilidade em feedback, navegação e estados interativos
- pipeline de build com Vite para empacotamento e preview consistente

## Stack e Tecnologias

- HTML5 semantico
- CSS3 (tokens visuais, layout responsivo, motion-control)
- JavaScript ES2020+
- Vite (dev server, build e preview)
- Integracao com API REST (`/api/v1`)

## Funcionalidades Principais

- explorador de projetos com busca, categoria, ordenacao e favoritos
- sincronizacao de estado de filtro na URL (`q`, `tag`, `sort`, `fav`)
- botao de compartilhamento dos filtros ativos
- exportacao de favoritos em JSON
- historico de projetos visualizados recentemente
- modal acessivel com foco gerenciado e suporte a teclado
- dashboard de insights (categorias, stacks e linha temporal)
- formulario de contato com validacao robusta e fallback para `mailto`
- status de conectividade com backend (API online/offline)

## Estrutura do Projeto

```text
Portfolio-Integrado-main/
├── index.html
├── style.css
├── script.js
├── package.json
├── package-lock.json
├── vite.config.mjs
├── backend/
│   ├── src/
│   ├── tests/
│   └── package.json
└── README.md
```

## Setup, Desenvolvimento e Build

### Pre-requisitos

- Node.js 18+
- npm 9+

### Frontend (Vite)

Instalacao:

```bash
npm install
```

Desenvolvimento local:

```bash
npm run dev
```

Build de producao:

```bash
npm run build
```

Preview do build:

```bash
npm run preview
```

Observacao: o `vite.config.mjs` inclui proxy `/api` para `http://localhost:3000`, facilitando desenvolvimento integrado com o backend.

### Backend (opcional para integração completa)

```bash
cd backend
npm install
npm run dev
```

Testes backend:

```bash
cd backend
npm test
```

## Boas Praticas Adotadas

- design system baseado em tokens (cores, tipografia, espacos, estados)
- separacao clara de responsabilidades por funcoes de UI e dados
- atualizacoes de tela previsiveis e sem mutacoes perigosas
- sanitizacao de dados para renderizacao segura no DOM
- feedback de estado com `aria-live` e foco visivel
- degradacao elegante quando a API estiver indisponivel
- otimização de performance com `content-visibility`, debounce e render incremental

## Melhorias Futuras

- modularizacao do JavaScript em multiplos arquivos de feature
- testes E2E do frontend (Playwright/Cypress)
- i18n (pt-BR/en-US) com detecao de idioma
- analytics de funil (exploracao -> contato)
- score automatico de acessibilidade em CI
- suporte offline com service worker dedicado

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
