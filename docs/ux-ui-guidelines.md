# UX/UI Decisions and Design System

## 1. Contexto de Produto

O portfolio funciona como canal de descoberta tecnica e conversao comercial. A interface precisa cumprir dois objetivos simultaneos:

- facilitar avaliacao rapida de capacidade tecnica;
- reduzir atrito no contato para oportunidades qualificadas.

## 2. Principais Friccoes Encontradas

- falta de feedback de progresso no formulario (incerteza sobre conclusao);
- navegação mobile com muitos destinos e baixa velocidade de acesso;
- pouca percepcao de orientacao durante scroll em pagina longa;
- estados de processamento pouco explicitos em recomendacoes.

## 3. Decisoes de UX

### 3.1 Jornada e navegacao

- Inclusao de `scroll progress` para orientar leitura em paginas extensas.
- Inclusao de `mobile dock` com atalhos de alta intencao (`Projetos`, `Recomendar`, `Contato`).
- Scroll spy compartilhado entre menu principal e dock mobile para manter previsibilidade de contexto.

### 3.2 Conversao no formulario

- Barra de progresso de briefing com percentual e estado final (`pronto para envio`).
- CTA de envio habilitado apenas quando os campos obrigatorios estao validos.
- Foco automatico no primeiro campo invalido no submit.
- Hints contextuais por campo para reduzir erro de preenchimento.

### 3.3 Feedback e microinteracao

- Estados de `aria-busy` e mensagens durante recomendacao.
- Reforco visual de erro em inputs (`aria-invalid`) para leitura imediata.
- Persistencia de rascunho para reduzir abandono por interrupcao.

## 4. Design System

### 4.1 Tokens

- Cores semanticas:
  - `--color-brand` / `--color-brand-strong`
  - `--color-accent`
  - `--color-success`
  - `--color-danger`
  - `--color-text` / `--color-text-muted`
- Tipografia:
  - `--font-heading: Space Grotesk`
  - `--font-body: Manrope`
  - `--font-mono: IBM Plex Mono`
- Espacamento:
  - escala `--space-1` ate `--space-7`
- Raio e profundidade:
  - `--radius-sm..xl`
  - `--shadow-sm..lg`

### 4.2 Componentes reutilizaveis

- `btn` (`primary`, `ghost`, `disabled`, `focus-visible`)
- `card` (base de containers)
- `field` + mensagens (`field-hint`, `field-error`)
- `status-chip` para feedback operacional
- `trend-list` para leitura de insights
- `mobile-dock` para navegacao contextual mobile

### 4.3 Estados padrao

- Interacao: `hover`, `focus-visible`, `active`
- Validacao: `aria-invalid=true`
- Processamento: `aria-busy=true`
- Sucesso/erro: classes de feedback (`is-success`, `is-error`)
- Bloqueio de acao: `disabled` + `aria-disabled`

## 5. Acessibilidade (WCAG)

Aplicacoes práticas implementadas:

- `skip-link` funcional;
- foco visivel consistente (`focus ring`);
- navegação completa por teclado;
- landmarks semanticos (`header`, `main`, `nav`, `section`, `footer`);
- `aria-live` para mensagens dinâmicas;
- relacao explicita de campos com dicas/erros via `aria-describedby`;
- contraste semantico em estados de alerta e sucesso;
- suporte a `prefers-reduced-motion`.

## 6. Responsividade

Breakpoints principais:

- `1120px`: reorganizacao de grids densos;
- `960px`: navegação colapsada;
- `760px`: layout de coluna unica + dock mobile fixo.

Diretriz: priorizar clareza de leitura e proximidade de acao (thumb zone) no mobile.

## 7. Guia para Engenharia

- Reutilizar classes base (`btn`, `card`, `field`) antes de criar variantes novas.
- Manter tokens como unica fonte de verdade visual.
- Toda interacao assincrona deve expor estado (`aria-busy` e feedback textual).
- Toda validacao deve refletir estado visual e semantico (`aria-invalid`).
- Novos componentes devem incluir desktop e mobile no mesmo PR.