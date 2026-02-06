# Portfolio Integrado - Matheus Siqueira

Portfólio profissional orientado a dados e engenharia de software, com foco em apresentação estratégica de projetos, experiência, habilidades e canais de contato.

A aplicação foi refatorada para uma base front-end mais robusta, acessível e preparada para evoluções de produto.

## Visão Geral do Projeto

Este projeto tem como objetivo apresentar o posicionamento profissional de Matheus Siqueira de forma moderna e objetiva, conectando:

- Experiência em análise de dados e performance
- Evolução para desenvolvimento full stack
- Projetos com aplicação real e contexto técnico
- Conversão de contato com fluxo validado e sem atrito

## Público-Alvo

- Recrutadores e lideranças técnicas
- Gestores de produto e negócio
- Parceiros e clientes em busca de desenvolvimento de soluções digitais

## Principais Funcionalidades

- Interface completa responsiva (desktop e mobile)
- Tema claro/escuro com persistência em `localStorage`
- Navegação sticky com destaque automático da seção ativa (scroll spy)
- Barra de progresso de leitura da página
- Animações de entrada com `IntersectionObserver`
- Contadores de impacto animados
- Vitrine de projetos com:
  - Filtros por categoria
  - Busca textual em tempo real
- Formulário de contato com validação de campos
- Geração de link `mailto` validado para envio direto
- Ação de copiar e-mail para área de transferência

## Tecnologias Utilizadas

- HTML5 semântico
- CSS3 (design tokens, Grid, Flexbox, media queries, `prefers-reduced-motion`)
- JavaScript Vanilla (ES6+)
- Google Fonts (`Sora`, `Space Mono`)

## Arquitetura e Boas Práticas Aplicadas

- Estrutura semântica com foco em acessibilidade
- Organização em componentes visuais reutilizáveis (`card`, `btn`, `chip`, etc.)
- Tokens de design para manter consistência visual e facilitar manutenção
- JavaScript modular por responsabilidade:
  - tema
  - navegação
  - scroll progress
  - scroll spy
  - animações/reveal
  - contadores
  - exploração de projetos
  - formulário de contato
- Validação de entrada no cliente para melhor UX
- `rel="noopener noreferrer"` em links externos
- Suporte a redução de movimento para usuários sensíveis a animações

## Melhorias Implementadas Nesta Versão

### Técnicas

- Refactor completo da estrutura HTML/CSS/JS
- Redução de acoplamento no JavaScript
- Reestruturação da navegação e estados interativos
- Melhoria da legibilidade e manutenibilidade do código

### UI/UX

- Nova hierarquia visual e direção de design mais profissional
- Melhor distribuição de conteúdo e clareza de leitura
- Fluxos de navegação e contato mais diretos
- Feedbacks visuais de erro/sucesso mais explícitos

## Como Executar Localmente

### Pré-requisitos

- Navegador moderno (Chrome, Edge, Firefox, Safari)

### Passos

1. Clone o repositório:

```bash
git clone https://github.com/matheussiqueira-dev/Portfolio-Integrado.git
```

2. Acesse a pasta do projeto:

```bash
cd Portfolio-Integrado
```

3. Abra o arquivo `index.html` no navegador.

Opcional (VS Code + Live Server):

1. Abra a pasta no VS Code.
2. Execute `Open with Live Server` no `index.html`.

## Estrutura do Projeto

```text
.
├── index.html
├── style.css
├── script.js
├── README.md
└── LICENSE
```

## Performance e Acessibilidade

- Layout com baixo custo de renderização
- Sem dependência de framework para runtime
- Feedback de foco visível em elementos interativos
- Skip link para navegação por teclado
- Estados de erro acessíveis no formulário
- Respeito a `prefers-reduced-motion`

## Possíveis Melhorias Futuras

- Integração real de formulário com serviço backend (API própria, Formspree ou similar)
- Internacionalização (`pt-BR` / `en-US`)
- CMS leve para atualização de projetos sem editar código
- Testes automatizados de regressão visual e acessibilidade
- Pipeline CI/CD com verificação de qualidade (lint, validação HTML e Lighthouse)

## Licença

Este projeto está sob a licença MIT. Consulte `LICENSE` para detalhes.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
