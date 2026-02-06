# Portfolio Integrado - Frontend Profissional

Aplicacao frontend estatica desenvolvida para representar o posicionamento profissional de Matheus Siqueira com foco em dados, engenharia de software e experiencia do usuario.

A versao atual passou por refactor completo de arquitetura, UI/UX e acessibilidade, com foco em manutenibilidade e evolucao futura.

## Visao Geral do Frontend

O frontend foi projetado para resolver tres objetivos principais:

- Comunicar rapidamente proposta de valor profissional
- Facilitar descoberta de projetos por contexto tecnico
- Aumentar conversao de contato com fluxo simples e validado

## Analise Tecnica do Projeto

### Proposito e publico-alvo

- Proposito: apresentar portfolio com credibilidade tecnica e clareza de negocio
- Publico-alvo: recrutadores, gestores de produto, liderancas tecnicas e clientes

### Fluxos principais

1. Usuario acessa a pagina e entende posicionamento profissional
2. Explora projetos com filtro, busca e ordenacao
3. Analisa jornada e stack tecnica
4. Converte via formulario ou contato direto

### Diagnostico do estado anterior

- Arquivos principais continham residuos de conflito de merge
- Acoplamento alto no JavaScript
- UX funcional, mas sem mecanismos de descoberta avancada
- Acessibilidade parcial em navegacao e feedbacks
- SEO e metadados incompletos

## O que foi refatorado

### Arquitetura frontend

- Estrutura HTML semantica e orientada a acessibilidade
- CSS organizado por tokens, componentes e layout responsivo
- JavaScript modular por responsabilidade (tema, navegacao, scroll, projetos, formulario)

### Performance e renderizacao

- Scroll progress com `requestAnimationFrame`
- Uso de `IntersectionObserver` para reveal/counters
- `content-visibility` em secoes para reduzir custo inicial de renderizacao
- Debounce na busca de projetos

### Acessibilidade e UX

- `skip-link` para navegacao por teclado
- Estados de foco visiveis e consistentes
- `aria-live` em mensagens de status e erros
- Suporte a `prefers-reduced-motion`
- Modal de projeto com fechamento por `Esc` e controle de foco

### SEO

- Metadados essenciais (`description`, `keywords`, `canonical`, Open Graph, Twitter)
- JSON-LD (`schema.org/Person`)
- `robots.txt` e `sitemap.xml`
- `site.webmanifest`

## Novas Funcionalidades Implementadas

- Explorador de projetos com filtros por categoria
- Busca textual em tempo real
- Ordenacao por relevancia, data e ordem alfabetica
- Persistencia do estado de filtros/busca na URL
- Modal de detalhes do projeto
- Barra de progresso de leitura da pagina
- Scroll spy para destacar secao ativa no menu
- Contadores animados de indicadores
- Formulario com validacao robusta e contador de caracteres
- Copia de email para area de transferencia

## Stack e Tecnologias Utilizadas

- HTML5
- CSS3 (design tokens, Grid, Flexbox, media queries)
- JavaScript Vanilla (ES6+)
- Google Fonts (Manrope, IBM Plex Mono)

## Estrutura do Projeto

```text
.
├── index.html
├── style.css
├── script.js
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── README.md
└── LICENSE
```

## Setup e Execucao Local

### Requisitos

- Navegador moderno (Chrome, Edge, Firefox, Safari)

### Execucao rapida

1. Clone o repositorio:

```bash
git clone https://github.com/matheussiqueira-dev/Portfolio-Integrado.git
```

2. Entre na pasta:

```bash
cd Portfolio-Integrado
```

3. Execute um servidor local simples:

```bash
python -m http.server 5500
```

4. Acesse:

```text
http://localhost:5500
```

## Build e Deploy

Projeto estatico, sem etapa de build obrigatoria.

Deploy recomendado:

- GitHub Pages apontando para branch `main` na raiz do projeto

## Boas Praticas Adotadas

- Semantica HTML e acessibilidade como padrao
- Baixo acoplamento em JavaScript
- Componentizacao visual por classes reutilizaveis
- Tokens de design para consistencia e escalabilidade
- Foco em clareza de codigo e manutencao em producao

## Melhorias Futuras

- Integracao real do formulario com backend/API
- Internacionalizacao (PT/EN)
- Testes automatizados de acessibilidade e regressao visual
- Pipeline CI com validacao de HTML, lint e Lighthouse
- Extracao de dados de projetos para JSON externo/CMS leve

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
