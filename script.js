(() => {
    "use strict";

    const FALLBACK_PROJECTS = [
        {
            id: "ferias",
            title: "Sistema de Ferias - Prefeitura de Jaboatao",
            summary: "Plataforma para solicitacao, aprovacao e controle de ferias com trilha de auditoria.",
            impact: "Padronizou aprovacao gerencial e reduziu gargalos operacionais de RH.",
            year: 2025,
            stack: ["Node.js", "Prisma", "PostgreSQL", "JavaScript"],
            tags: ["backend", "dados"],
            url: "https://github.com/matheussiqueira-dev/backsist-ferias"
        },
        {
            id: "aria",
            title: "Projeto Aria - A3",
            summary: "Automacoes de setup para Raspberry Pi com scripts reprodutiveis de manutencao.",
            impact: "Acelerou configuracao de hardware low-cost para ambientes de prova de conceito.",
            year: 2024,
            stack: ["Linux", "Bash", "Raspberry Pi"],
            tags: ["iot", "backend"],
            url: "https://github.com/matheussiqueira-dev/Projeto_Aria"
        },
        {
            id: "aurora",
            title: "Banco Aurora",
            summary: "Sistema bancario em CLI com autenticacao, transacoes e persistencia local.",
            impact: "Consolidou fundamentos de modelagem transacional e regra de negocio.",
            year: 2024,
            stack: ["Python", "Typer"],
            tags: ["python", "backend"],
            url: "https://github.com/matheussiqueira-dev/banco_aurora"
        },
        {
            id: "dashboard-tributario",
            title: "Dashboards Tributarios - SEFAZ",
            summary: "Dashboards para leitura de arrecadacao e monitoramento de performance fiscal.",
            impact: "Melhorou clareza de indicadores para decisao estrategica.",
            year: 2026,
            stack: ["Power BI", "SQL", "DAX"],
            tags: ["dados"],
            url: "https://github.com/matheussiqueira-dev"
        },
        {
            id: "portfolio-integrado",
            title: "Portfolio Integrado",
            summary: "Refactor completo de portfolio com design system, API e acessibilidade.",
            impact: "Aumentou descoberta de conteudo e escalabilidade de manutencao.",
            year: 2026,
            stack: ["HTML", "CSS", "JavaScript", "Node.js"],
            tags: ["frontend", "backend"],
            url: "https://github.com/matheussiqueira-dev/Portfolio-Integrado"
        }
    ];

    const THEME_STORAGE_KEY = "portfolio-theme-v2";
    const FAVORITES_STORAGE_KEY = "portfolio-favorites-v2";
    const RECENT_PROJECTS_STORAGE_KEY = "portfolio-recent-projects-v1";
    const CONTACT_DRAFT_STORAGE_KEY = "portfolio-contact-draft-v1";
    const URL_PARAM_SEARCH = "q";
    const URL_PARAM_TAG = "tag";
    const URL_PARAM_SORT = "sort";
    const URL_PARAM_FAVORITES = "fav";
    const RECOMMENDATION_LIMIT = 3;
    const API_BASE = getApiBase();

    const state = {
        projects: [],
        insights: null,
        dataSource: "loading",
        filters: {
            search: "",
            tag: "all",
            sort: "recent",
            favoritesOnly: false
        },
        favorites: loadFavoriteIds(),
        recentProjectIds: loadRecentProjectIds(),
        modalProjectId: null,
        modalTrigger: null,
        recommendedProjects: []
    };

    let modalAbortController = null;

    document.addEventListener("DOMContentLoaded", () => {
        setCurrentYear();
        initializeThemeToggle();
        initializeNavigation();
        initializeRevealObserver();
        initializeCounters();
        initializeScrollSpy();
        hydrateFiltersFromUrl();
        initializeProjectExplorer();
        initializeRecommendationStudio();
        initializeModal();
        initializeCopyEmail();
        initializeContactForm();

        loadPortfolioData().then(() => {
            renderTagFilterOptions();
            renderProjects();
            renderRecentProjects();
            renderInsights();
            runRecommendations({ preferApi: true });
        });
    });

    function getApiBase() {
        const apiBaseMeta = document.querySelector('meta[name="portfolio-api-base"]');
        const value = apiBaseMeta?.getAttribute("content")?.trim() || "/api/v1";
        return value.replace(/\/+$/, "");
    }

    function hydrateFiltersFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const searchFromUrl = sanitizeText(params.get(URL_PARAM_SEARCH) || "").slice(0, 120);
        const tagFromUrl = sanitizeToken(params.get(URL_PARAM_TAG) || "all");
        const sortFromUrl = params.get(URL_PARAM_SORT);
        const favoritesOnlyFromUrl = params.get(URL_PARAM_FAVORITES);

        state.filters.search = searchFromUrl;
        state.filters.tag = tagFromUrl || "all";
        state.filters.sort = sortFromUrl === "alpha" ? "alpha" : "recent";
        state.filters.favoritesOnly = favoritesOnlyFromUrl === "1";
    }

    function syncFiltersToUrl() {
        const params = new URLSearchParams();

        if (state.filters.search) {
            params.set(URL_PARAM_SEARCH, state.filters.search);
        }

        if (state.filters.tag && state.filters.tag !== "all") {
            params.set(URL_PARAM_TAG, state.filters.tag);
        }

        if (state.filters.sort === "alpha") {
            params.set(URL_PARAM_SORT, "alpha");
        }

        if (state.filters.favoritesOnly) {
            params.set(URL_PARAM_FAVORITES, "1");
        }

        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
        window.history.replaceState({}, "", nextUrl);
    }

    function setCurrentYear() {
        const target = document.getElementById("current-year");
        if (target) {
            target.textContent = String(new Date().getFullYear());
        }
    }

    function initializeThemeToggle() {
        const root = document.documentElement;
        const button = document.getElementById("theme-toggle");
        const label = button?.querySelector(".theme-toggle__label");

        if (!button) {
            return;
        }

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const persistedTheme = safeStorageGet(THEME_STORAGE_KEY);
        const initialTheme = persistedTheme || (prefersDark ? "dark" : "light");

        applyTheme(initialTheme);

        button.addEventListener("click", () => {
            const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
            safeStorageSet(THEME_STORAGE_KEY, nextTheme);
        });

        function applyTheme(theme) {
            root.dataset.theme = theme;
            const darkThemeEnabled = theme === "dark";
            button.setAttribute("aria-label", darkThemeEnabled ? "Ativar tema claro" : "Ativar tema escuro");
            if (label) {
                label.textContent = darkThemeEnabled ? "Tema escuro" : "Tema claro";
            }
        }
    }

    function initializeNavigation() {
        const toggleButton = document.getElementById("menu-toggle");
        const navList = document.getElementById("nav-list");

        if (!toggleButton || !navList) {
            return;
        }

        const closeMenu = () => {
            toggleButton.setAttribute("aria-expanded", "false");
            navList.dataset.open = "false";
        };

        toggleButton.addEventListener("click", () => {
            const currentlyOpen = toggleButton.getAttribute("aria-expanded") === "true";
            toggleButton.setAttribute("aria-expanded", String(!currentlyOpen));
            navList.dataset.open = String(!currentlyOpen);
        });

        navList.addEventListener("click", event => {
            if (event.target instanceof HTMLElement && event.target.closest("a")) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 920) {
                closeMenu();
            }
        });
    }

    function initializeScrollSpy() {
        const links = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
        if (!links.length || !window.IntersectionObserver) {
            return;
        }

        const entries = links
            .map(link => {
                const id = link.getAttribute("href")?.slice(1);
                const section = id ? document.getElementById(id) : null;
                if (!id || !section) {
                    return null;
                }
                return { id, section, link };
            })
            .filter(Boolean);

        if (!entries.length) {
            return;
        }

        const setCurrent = id => {
            entries.forEach(entry => {
                if (entry.id === id) {
                    entry.link.setAttribute("aria-current", "true");
                } else {
                    entry.link.removeAttribute("aria-current");
                }
            });
        };

        const observer = new IntersectionObserver(
            observed => {
                observed.forEach(entry => {
                    if (entry.isIntersecting) {
                        setCurrent(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-42% 0px -52% 0px",
                threshold: 0.01
            }
        );

        entries.forEach(entry => observer.observe(entry.section));
    }

    function initializeRevealObserver() {
        const revealElements = document.querySelectorAll(".reveal");

        if (!revealElements.length) {
            return;
        }

        if (!window.IntersectionObserver) {
            revealElements.forEach(element => element.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14 }
        );

        revealElements.forEach(element => observer.observe(element));
    }

    function initializeCounters() {
        const counters = document.querySelectorAll("[data-counter]");
        if (!counters.length) {
            return;
        }

        const numberFormatter = new Intl.NumberFormat("pt-BR");
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const renderFinalState = element => {
            const target = Number(element.getAttribute("data-counter")) || 0;
            const prefix = element.getAttribute("data-prefix") || "";
            const suffix = element.getAttribute("data-suffix") || "";
            element.textContent = `${prefix}${numberFormatter.format(target)}${suffix}`;
        };

        if (prefersReducedMotion || !window.IntersectionObserver) {
            counters.forEach(renderFinalState);
            return;
        }

        const animateCounter = element => {
            const target = Number(element.getAttribute("data-counter")) || 0;
            const prefix = element.getAttribute("data-prefix") || "";
            const suffix = element.getAttribute("data-suffix") || "";
            const duration = 1100;
            const start = performance.now();

            const tick = now => {
                const progress = Math.min((now - start) / duration, 1);
                const current = Math.round(target * progress);
                element.textContent = `${prefix}${numberFormatter.format(current)}${suffix}`;
                if (progress < 1) {
                    window.requestAnimationFrame(tick);
                }
            };

            window.requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.35 }
        );

        counters.forEach(counter => observer.observe(counter));
    }

    function initializeProjectExplorer() {
        const searchInput = document.getElementById("project-search");
        const tagSelect = document.getElementById("project-tag");
        const sortSelect = document.getElementById("project-sort");
        const favoritesOnlyCheckbox = document.getElementById("favorites-only");
        const clearFiltersButton = document.getElementById("clear-project-filters");
        const shareFiltersButton = document.getElementById("share-project-filters");
        const exportFavoritesButton = document.getElementById("export-favorites");
        const recentProjectsList = document.getElementById("recent-projects-list");
        const toolbarFeedback = document.getElementById("project-toolbar-feedback");
        const projectGrid = document.getElementById("project-grid");

        if (!searchInput || !tagSelect || !sortSelect || !favoritesOnlyCheckbox || !clearFiltersButton || !projectGrid) {
            return;
        }

        searchInput.value = state.filters.search;
        sortSelect.value = state.filters.sort;
        favoritesOnlyCheckbox.checked = state.filters.favoritesOnly;

        const handleSearch = debounce(value => {
            state.filters.search = value;
            syncFiltersToUrl();
            renderProjects();
        }, 140);

        searchInput.addEventListener("input", event => {
            handleSearch((event.target.value || "").trim());
        });

        tagSelect.addEventListener("change", event => {
            state.filters.tag = event.target.value || "all";
            syncFiltersToUrl();
            renderProjects();
        });

        sortSelect.addEventListener("change", event => {
            state.filters.sort = event.target.value === "alpha" ? "alpha" : "recent";
            syncFiltersToUrl();
            renderProjects();
        });

        favoritesOnlyCheckbox.addEventListener("change", event => {
            state.filters.favoritesOnly = Boolean(event.target.checked);
            syncFiltersToUrl();
            renderProjects();
        });

        clearFiltersButton.addEventListener("click", () => {
            state.filters = {
                search: "",
                tag: "all",
                sort: "recent",
                favoritesOnly: false
            };

            searchInput.value = "";
            tagSelect.value = "all";
            sortSelect.value = "recent";
            favoritesOnlyCheckbox.checked = false;
            syncFiltersToUrl();
            setToolbarFeedback("Filtros redefinidos para o estado padrao.");
            renderProjects();
        });

        shareFiltersButton?.addEventListener("click", async () => {
            const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;

            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(shareUrl);
                    setToolbarFeedback("URL dos filtros copiada para a area de transferencia.");
                    return;
                }
                throw new Error("Clipboard API indisponivel");
            } catch (_error) {
                setToolbarFeedback("Nao foi possivel copiar automaticamente a URL dos filtros.", true);
            }
        });

        exportFavoritesButton?.addEventListener("click", () => {
            const favoriteProjects = state.projects.filter(project => state.favorites.has(project.id));
            if (!favoriteProjects.length) {
                setToolbarFeedback("Adicione projetos aos favoritos antes de exportar.", true);
                return;
            }

            const payload = {
                generatedAt: new Date().toISOString(),
                total: favoriteProjects.length,
                projects: favoriteProjects
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const href = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = href;
            anchor.download = "portfolio-favoritos.json";
            anchor.click();
            URL.revokeObjectURL(href);

            setToolbarFeedback(`${favoriteProjects.length} favorito(s) exportado(s) com sucesso.`);
        });

        document.addEventListener("keydown", event => {
            if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }

            if (!(event.target instanceof HTMLElement)) {
                return;
            }

            const targetTag = event.target.tagName.toLowerCase();
            const typingContext = ["input", "textarea", "select"].includes(targetTag) || event.target.isContentEditable;
            if (typingContext) {
                return;
            }

            event.preventDefault();
            searchInput.focus();
            searchInput.select();
        });

        projectGrid.addEventListener("click", event => {
            if (!(event.target instanceof HTMLElement)) {
                return;
            }

            const detailsButton = event.target.closest("[data-project-details]");
            if (detailsButton) {
                const projectId = detailsButton.getAttribute("data-project-details") || "";
                const project = state.projects.find(item => item.id === projectId);
                if (project) {
                    openProjectModal(project, detailsButton);
                }
                return;
            }

            const favoriteButton = event.target.closest("[data-project-favorite]");
            if (favoriteButton) {
                const projectId = favoriteButton.getAttribute("data-project-favorite") || "";
                toggleFavorite(projectId);
                renderProjects();
            }
        });

        recentProjectsList?.addEventListener("click", event => {
            if (!(event.target instanceof HTMLElement)) {
                return;
            }

            const openButton = event.target.closest("[data-recent-open]");
            if (!openButton) {
                return;
            }

            const projectId = openButton.getAttribute("data-recent-open") || "";
            const project = state.projects.find(item => item.id === projectId);
            if (project) {
                openProjectModal(project, openButton);
            }
        });

        function setToolbarFeedback(message, isError = false) {
            if (!toolbarFeedback) {
                return;
            }

            toolbarFeedback.classList.remove("is-success", "is-error");
            toolbarFeedback.classList.add(isError ? "is-error" : "is-success");
            toolbarFeedback.textContent = message;
        }
    }

    function initializeRecommendationStudio() {
        const interestInput = document.getElementById("recommendation-interest");
        const searchInput = document.getElementById("recommendation-search");
        const runButton = document.getElementById("recommendation-run");
        const list = document.getElementById("recommendation-list");
        const feedback = document.getElementById("recommendation-feedback");

        if (!(interestInput instanceof HTMLInputElement) ||
            !(searchInput instanceof HTMLInputElement) ||
            !(runButton instanceof HTMLButtonElement) ||
            !list ||
            !feedback) {
            return;
        }

        if (!interestInput.value.trim()) {
            interestInput.value = "backend,dados,api";
        }

        runButton.addEventListener("click", async () => {
            await runRecommendations({ preferApi: state.dataSource !== "fallback" });
        });

        searchInput.addEventListener(
            "input",
            debounce(() => {
                runRecommendations({ preferApi: state.dataSource !== "fallback" });
            }, 220)
        );

        const chips = document.querySelectorAll("[data-interest-chip]");
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                const value = chip.getAttribute("data-interest-chip") || "";
                interestInput.value = value;
                runRecommendations({ preferApi: state.dataSource !== "fallback" });
            });
        });

        list.addEventListener("click", event => {
            if (!(event.target instanceof HTMLElement)) {
                return;
            }

            const openButton = event.target.closest("[data-recommend-open]");
            if (!openButton) {
                return;
            }

            const projectId = openButton.getAttribute("data-recommend-open") || "";
            const project = state.projects.find(item => item.id === projectId)
                || state.recommendedProjects.find(item => item.id === projectId);

            if (project) {
                openProjectModal(project, openButton);
            }
        });
    }

    async function runRecommendations({ preferApi = true } = {}) {
        const interestInput = document.getElementById("recommendation-interest");
        const searchInput = document.getElementById("recommendation-search");
        const list = document.getElementById("recommendation-list");
        const feedback = document.getElementById("recommendation-feedback");

        if (!(interestInput instanceof HTMLInputElement) ||
            !(searchInput instanceof HTMLInputElement) ||
            !list ||
            !feedback) {
            return;
        }

        const interest = interestInput.value.trim();
        const search = searchInput.value.trim();
        const interestTokens = tokenizeRecommendationValue(interest);
        const searchTokens = tokenizeRecommendationValue(search);

        if (!state.projects.length) {
            feedback.textContent = "Carregando projetos para gerar recomendacoes.";
            list.textContent = "";
            return;
        }

        let recommended = [];
        let source = "local";

        if (preferApi) {
            try {
                const params = new URLSearchParams({
                    interest,
                    search,
                    status: "published",
                    limit: String(RECOMMENDATION_LIMIT)
                });

                const response = await fetchJson(`${API_BASE}/projects/recommendations?${params.toString()}`);
                const items = Array.isArray(response.items) ? response.items : [];
                recommended = items.map((project, index) => normalizeProject(project, index));
                source = "api";
            } catch (_error) {
                recommended = [];
            }
        }

        if (!recommended.length) {
            recommended = getLocalRecommendations({
                interestTokens,
                searchTokens,
                limit: RECOMMENDATION_LIMIT
            });
            source = "local";
        }

        state.recommendedProjects = recommended;
        renderRecommendations(list, recommended);

        if (!recommended.length) {
            feedback.textContent = "Nenhum projeto aderente ao contexto informado.";
            return;
        }

        feedback.textContent = `Sugestoes geradas com base em ${source === "api" ? "ranking da API" : "analise local resiliente"}.`;
    }

    function renderRecommendations(container, projects) {
        container.textContent = "";

        if (!projects.length) {
            const empty = document.createElement("li");
            empty.className = "recommendation-empty";
            empty.textContent = "Sem recomendacoes disponiveis no momento.";
            container.append(empty);
            return;
        }

        const fragment = document.createDocumentFragment();

        projects.forEach(project => {
            const item = document.createElement("li");
            item.className = "recommendation-item card";

            const title = document.createElement("h4");
            title.textContent = project.title;

            const context = document.createElement("p");
            const matchedTags = Array.isArray(project.recommendation?.matchedTags)
                ? project.recommendation.matchedTags.map(formatTag).join(" | ")
                : "";
            context.textContent = matchedTags
                ? `Aderencia: ${matchedTags}`
                : "Aderencia: baseado em stack e contexto de entrega.";

            const summary = document.createElement("p");
            summary.textContent = project.summary;

            const actions = document.createElement("div");
            actions.className = "recommendation-actions";

            const openButton = document.createElement("button");
            openButton.type = "button";
            openButton.className = "project-button";
            openButton.setAttribute("data-recommend-open", project.id);
            openButton.textContent = "Ver detalhes";

            const repoLink = document.createElement("a");
            repoLink.href = project.url;
            repoLink.target = "_blank";
            repoLink.rel = "noopener noreferrer";
            repoLink.className = "project-link";
            repoLink.textContent = "Repositorio";

            actions.append(openButton, repoLink);
            item.append(title, context, summary, actions);
            fragment.append(item);
        });

        container.append(fragment);
    }

    function getLocalRecommendations({ interestTokens, searchTokens, limit }) {
        const tokens = [...new Set([...interestTokens, ...searchTokens])];

        const ranked = state.projects
            .map(project => {
                const reason = scoreLocalRecommendation(project, tokens);
                return {
                    project,
                    score: reason.score,
                    reason
                };
            })
            .filter(item => tokens.length === 0 || item.score > 0)
            .sort((a, b) => b.score - a.score || Number(b.project.year) - Number(a.project.year))
            .slice(0, limit)
            .map(item => ({
                ...item.project,
                recommendation: item.reason
            }));

        return ranked;
    }

    function scoreLocalRecommendation(project, tokens) {
        const tags = Array.isArray(project.tags) ? project.tags : [];
        const stack = Array.isArray(project.stack) ? project.stack : [];
        const content = normalize([project.title, project.summary, project.impact].join(" "));

        const matches = {
            matchedTags: [],
            matchedStack: [],
            matchedTerms: []
        };

        let score = 0;

        tokens.forEach(token => {
            if (tags.includes(token)) {
                matches.matchedTags.push(token);
                score += 4;
            }

            const hasStackMatch = stack.some(item => normalize(item).includes(token));
            if (hasStackMatch) {
                matches.matchedStack.push(token);
                score += 2;
            }

            if (content.includes(token)) {
                matches.matchedTerms.push(token);
                score += 1;
            }
        });

        score += Math.max(Number(project.year) - 2020, 0) * 0.04;

        return {
            score: Number(score.toFixed(2)),
            matchedTags: [...new Set(matches.matchedTags)],
            matchedStack: [...new Set(matches.matchedStack)],
            matchedTerms: [...new Set(matches.matchedTerms)]
        };
    }

    function initializeModal() {
        const modal = document.getElementById("project-modal");

        if (!modal) {
            return;
        }

        modal.addEventListener("click", event => {
            if (event.target instanceof HTMLElement && event.target.closest("[data-modal-close]")) {
                closeProjectModal();
            }
        });

        const favoriteButton = document.getElementById("modal-favorite");
        if (favoriteButton) {
            favoriteButton.addEventListener("click", () => {
                if (!state.modalProjectId) {
                    return;
                }

                toggleFavorite(state.modalProjectId);
                refreshModalFavoriteButton();
                renderProjects();
            });
        }
    }

    async function loadPortfolioData() {
        setApiStatus("loading", "Conectando API...");
        setProjectGridBusyState(true);

        let projectsFromApi = null;
        try {
            try {
                const payload = await fetchJson(`${API_BASE}/projects?status=published&limit=50`);
                if (Array.isArray(payload.items) && payload.items.length) {
                    projectsFromApi = payload.items.map(normalizeProject);
                }
            } catch (_error) {
                projectsFromApi = null;
            }

            if (projectsFromApi && projectsFromApi.length) {
                state.projects = projectsFromApi;
                state.dataSource = "api";
                setApiStatus("ok", `API online (${projectsFromApi.length} projetos carregados).`);
            } else {
                state.projects = FALLBACK_PROJECTS.map(normalizeProject);
                state.dataSource = "fallback";
                setApiStatus("offline", "API indisponivel. Exibindo base local resiliente.");
            }

            try {
                const insightPayload = await fetchJson(`${API_BASE}/projects/insights?status=published`);
                state.insights = normalizeInsights(insightPayload, state.projects);
            } catch (_error) {
                state.insights = deriveInsights(state.projects);
            }
        } finally {
            setProjectGridBusyState(false);
        }
    }

    function renderTagFilterOptions() {
        const tagSelect = document.getElementById("project-tag");
        if (!tagSelect) {
            return;
        }

        const tags = [...new Set(state.projects.flatMap(project => project.tags))].sort((a, b) => a.localeCompare(b, "pt-BR"));
        const currentValue = state.filters.tag;

        tagSelect.innerHTML = "";

        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "Todas";
        tagSelect.append(allOption);

        tags.forEach(tag => {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = formatTag(tag);
            tagSelect.append(option);
        });

        const normalizedTag = tags.includes(currentValue) || currentValue === "all" ? currentValue : "all";
        tagSelect.value = normalizedTag;
        if (state.filters.tag !== normalizedTag) {
            state.filters.tag = normalizedTag;
            syncFiltersToUrl();
        } else {
            state.filters.tag = normalizedTag;
        }
    }

    function renderProjects() {
        const grid = document.getElementById("project-grid");
        const resultCounter = document.getElementById("project-result-count");

        if (!grid || !resultCounter) {
            return;
        }

        const projects = getFilteredProjects();
        grid.textContent = "";

        if (!projects.length) {
            const emptyState = document.createElement("article");
            emptyState.className = "project-empty";
            emptyState.textContent = "Nenhum projeto corresponde aos filtros atuais. Ajuste os criterios e tente novamente.";
            grid.append(emptyState);
            resultCounter.textContent = "0 projetos encontrados.";
            renderRecentProjects();
            return;
        }

        const fragment = document.createDocumentFragment();
        projects.forEach(project => {
            fragment.append(buildProjectCard(project));
        });

        grid.append(fragment);
        const sourceLabel = state.dataSource === "api" ? "dados da API" : "modo local";
        resultCounter.textContent = `${projects.length} projeto(s) encontrado(s) (${sourceLabel}).`;
        renderRecentProjects();
    }

    function getFilteredProjects() {
        const normalizedSearch = normalize(state.filters.search);

        let filtered = state.projects.filter(project => {
            if (state.filters.tag !== "all" && !project.tags.includes(state.filters.tag)) {
                return false;
            }

            if (state.filters.favoritesOnly && !state.favorites.has(project.id)) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const corpus = normalize([
                project.title,
                project.summary,
                project.impact,
                project.year,
                project.stack.join(" "),
                project.tags.join(" ")
            ].join(" "));

            return corpus.includes(normalizedSearch);
        });

        if (state.filters.sort === "alpha") {
            filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
        } else {
            filtered = [...filtered].sort((a, b) => Number(b.year) - Number(a.year));
        }

        return filtered;
    }

    function buildProjectCard(project) {
        const card = document.createElement("article");
        card.className = "project-card";

        const title = document.createElement("h3");
        title.textContent = project.title;

        const summary = document.createElement("p");
        summary.textContent = project.summary;

        const impact = document.createElement("p");
        impact.textContent = `Impacto: ${project.impact}`;

        const meta = document.createElement("div");
        meta.className = "project-meta";
        meta.append(buildMetaChip(String(project.year)));
        project.tags.forEach(tag => meta.append(buildMetaChip(formatTag(tag))));

        const actions = document.createElement("div");
        actions.className = "project-actions";

        const repoLink = document.createElement("a");
        repoLink.className = "project-link";
        repoLink.href = project.url;
        repoLink.target = "_blank";
        repoLink.rel = "noopener noreferrer";
        repoLink.textContent = "Repositorio";

        const detailsButton = document.createElement("button");
        detailsButton.className = "project-button";
        detailsButton.type = "button";
        detailsButton.setAttribute("data-project-details", project.id);
        detailsButton.textContent = "Detalhes";

        const favoriteButton = document.createElement("button");
        favoriteButton.className = "project-button";
        favoriteButton.type = "button";
        favoriteButton.setAttribute("data-project-favorite", project.id);

        const favorite = state.favorites.has(project.id);
        favoriteButton.textContent = favorite ? "Favorito" : "Favoritar";
        favoriteButton.classList.toggle("is-favorite", favorite);
        favoriteButton.setAttribute("aria-pressed", String(favorite));

        actions.append(repoLink, detailsButton, favoriteButton);

        card.append(title, summary, impact, meta, actions);

        return card;
    }

    function buildMetaChip(content) {
        const chip = document.createElement("span");
        chip.textContent = content;
        return chip;
    }

    function renderInsights() {
        const insights = state.insights || deriveInsights(state.projects);

        const total = document.getElementById("insight-total");
        const categories = document.getElementById("insight-categories");
        const technologies = document.getElementById("insight-technologies");

        if (total) {
            total.textContent = String(insights.total || 0);
        }

        if (categories) {
            categories.textContent = String(Object.keys(insights.byTag || {}).length);
        }

        if (technologies) {
            technologies.textContent = String(insights.technologiesCount || 0);
        }

        renderTrendList(
            document.getElementById("insight-tags"),
            Object.entries(insights.byTag || {}).sort((a, b) => b[1] - a[1]).map(([key, value]) => [formatTag(key), value])
        );

        renderTrendList(
            document.getElementById("insight-stacks"),
            (insights.topStacks || []).map(item => [String(item.name), Number(item.total) || 0])
        );

        renderTrendList(
            document.getElementById("insight-years"),
            Object.entries(insights.byYear || {}).sort((a, b) => Number(b[0]) - Number(a[0]))
        );
    }

    function renderTrendList(container, entries) {
        if (!container) {
            return;
        }

        container.textContent = "";

        if (!entries.length) {
            const empty = document.createElement("li");
            empty.textContent = "Sem dados para exibir.";
            container.append(empty);
            return;
        }

        const maxValue = Math.max(...entries.map(entry => Number(entry[1]) || 0), 1);

        entries.forEach(([label, rawValue]) => {
            const value = Number(rawValue) || 0;
            const item = document.createElement("li");

            const topRow = document.createElement("div");
            topRow.className = "trend-label";

            const name = document.createElement("span");
            name.textContent = String(label);

            const total = document.createElement("strong");
            total.textContent = String(value);

            topRow.append(name, total);

            const bar = document.createElement("div");
            bar.className = "trend-bar";

            const fill = document.createElement("span");
            fill.style.width = `${Math.max((value / maxValue) * 100, 3)}%`;

            bar.append(fill);
            item.append(topRow, bar);
            container.append(item);
        });
    }

    function deriveInsights(projects) {
        const byTag = {};
        const byYear = {};
        const stackTotals = {};

        projects.forEach(project => {
            byYear[String(project.year)] = (byYear[String(project.year)] || 0) + 1;

            project.tags.forEach(tag => {
                byTag[tag] = (byTag[tag] || 0) + 1;
            });

            project.stack.forEach(technology => {
                stackTotals[technology] = (stackTotals[technology] || 0) + 1;
            });
        });

        const topStacks = Object.entries(stackTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, total]) => ({ name, total }));

        return {
            total: projects.length,
            byTag,
            byYear,
            topStacks,
            technologiesCount: Object.keys(stackTotals).length
        };
    }

    function normalizeInsights(payload, currentProjects) {
        if (!payload || typeof payload !== "object") {
            return deriveInsights(currentProjects);
        }

        const normalizedByTag = normalizeMap(payload.byTag);
        const normalizedByYear = normalizeMap(payload.byYear);

        const topStacks = Array.isArray(payload.topStacks)
            ? payload.topStacks
                .map(item => ({
                    name: sanitizeText(item?.name || ""),
                    total: Number(item?.total) || 0
                }))
                .filter(item => item.name && item.total > 0)
            : [];

        const technologiesCount = topStacks.length
            ? new Set(topStacks.map(item => item.name)).size
            : deriveInsights(currentProjects).technologiesCount;

        return {
            total: Number(payload.total) || currentProjects.length,
            byTag: normalizedByTag,
            byYear: normalizedByYear,
            topStacks,
            technologiesCount
        };
    }

    function normalizeMap(value) {
        if (!value || typeof value !== "object") {
            return {};
        }

        return Object.entries(value).reduce((accumulator, [key, count]) => {
            const normalizedKey = sanitizeText(key).toLowerCase();
            const normalizedCount = Number(count) || 0;

            if (normalizedKey && normalizedCount > 0) {
                accumulator[normalizedKey] = normalizedCount;
            }

            return accumulator;
        }, {});
    }

    function openProjectModal(project, triggerElement) {
        const modal = document.getElementById("project-modal");
        const title = document.getElementById("modal-title");
        const summary = document.getElementById("modal-summary");
        const impact = document.getElementById("modal-impact");
        const stack = document.getElementById("modal-stack");
        const tags = document.getElementById("modal-tags");
        const link = document.getElementById("modal-link");

        if (!modal || !title || !summary || !impact || !stack || !tags || !link) {
            return;
        }

        state.modalProjectId = project.id;
        state.modalTrigger = triggerElement instanceof HTMLElement ? triggerElement : null;
        trackRecentlyViewedProject(project.id);

        title.textContent = project.title;
        summary.textContent = project.summary;
        impact.textContent = `Impacto: ${project.impact}`;
        stack.textContent = `Stack: ${project.stack.join(" | ")}`;

        tags.textContent = "";
        project.tags.forEach(tag => {
            const item = document.createElement("li");
            item.textContent = formatTag(tag);
            tags.append(item);
        });

        link.href = project.url;
        refreshModalFavoriteButton();

        modal.hidden = false;
        document.body.style.overflow = "hidden";

        modalAbortController?.abort();
        modalAbortController = new AbortController();

        const focusable = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        if (firstFocusable instanceof HTMLElement) {
            firstFocusable.focus();
        }

        document.addEventListener(
            "keydown",
            event => {
                if (event.key === "Escape") {
                    closeProjectModal();
                    return;
                }

                if (event.key !== "Tab" || !focusable.length) {
                    return;
                }

                const activeElement = document.activeElement;

                if (event.shiftKey && activeElement === firstFocusable) {
                    event.preventDefault();
                    if (lastFocusable instanceof HTMLElement) {
                        lastFocusable.focus();
                    }
                } else if (!event.shiftKey && activeElement === lastFocusable) {
                    event.preventDefault();
                    if (firstFocusable instanceof HTMLElement) {
                        firstFocusable.focus();
                    }
                }
            },
            { signal: modalAbortController.signal }
        );
    }

    function refreshModalFavoriteButton() {
        const button = document.getElementById("modal-favorite");
        if (!(button instanceof HTMLButtonElement) || !state.modalProjectId) {
            return;
        }

        const favorite = state.favorites.has(state.modalProjectId);
        button.textContent = favorite ? "Remover favorito" : "Favoritar";
        button.setAttribute("aria-pressed", String(favorite));
        button.classList.toggle("is-favorite", favorite);
    }

    function closeProjectModal() {
        const modal = document.getElementById("project-modal");
        if (!modal) {
            return;
        }

        modal.hidden = true;
        document.body.style.overflow = "";

        modalAbortController?.abort();
        modalAbortController = null;

        if (state.modalTrigger instanceof HTMLElement) {
            state.modalTrigger.focus();
        }

        state.modalProjectId = null;
        state.modalTrigger = null;
    }

    function toggleFavorite(projectId) {
        const normalizedId = String(projectId || "").trim();
        if (!normalizedId) {
            return;
        }

        if (state.favorites.has(normalizedId)) {
            state.favorites.delete(normalizedId);
        } else {
            state.favorites.add(normalizedId);
        }

        persistFavoriteIds(state.favorites);
    }

    function trackRecentlyViewedProject(projectId) {
        const normalizedId = sanitizeToken(projectId);
        if (!normalizedId) {
            return;
        }

        state.recentProjectIds = [
            normalizedId,
            ...state.recentProjectIds.filter(id => id !== normalizedId)
        ].slice(0, 5);

        persistRecentProjectIds(state.recentProjectIds);
        renderRecentProjects();
    }

    function renderRecentProjects() {
        const list = document.getElementById("recent-projects-list");
        if (!list) {
            return;
        }

        list.textContent = "";

        const recentProjects = state.recentProjectIds
            .map(id => state.projects.find(project => project.id === id))
            .filter(Boolean);

        if (!recentProjects.length) {
            const empty = document.createElement("li");
            empty.className = "recent-projects__empty";
            empty.textContent = "Nenhum projeto visualizado recentemente.";
            list.append(empty);
            return;
        }

        const fragment = document.createDocumentFragment();

        recentProjects.forEach(project => {
            const item = document.createElement("li");

            const content = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = project.title;

            const subtitle = document.createElement("span");
            subtitle.textContent = `${project.year} • ${project.stack.join(" | ")}`;

            content.append(title, subtitle);

            const button = document.createElement("button");
            button.type = "button";
            button.setAttribute("data-recent-open", project.id);
            button.textContent = "Abrir";

            item.append(content, button);
            fragment.append(item);
        });

        list.append(fragment);
    }

    function initializeContactForm() {
        const form = document.getElementById("contact-form");
        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        const feedback = form.querySelector(".form-feedback");
        const submitButton = form.querySelector("#contact-submit");
        const counter = form.querySelector("#message-counter");

        const nameField = form.elements.namedItem("name");
        const emailField = form.elements.namedItem("email");
        const subjectField = form.elements.namedItem("subject");
        const messageField = form.elements.namedItem("message");
        const consentField = form.querySelector("#consent");

        if (!(nameField instanceof HTMLInputElement) ||
            !(emailField instanceof HTMLInputElement) ||
            !(subjectField instanceof HTMLInputElement) ||
            !(messageField instanceof HTMLTextAreaElement) ||
            !(consentField instanceof HTMLInputElement)) {
            return;
        }

        const fields = {
            name: nameField,
            email: emailField,
            subject: subjectField,
            message: messageField,
            consent: consentField
        };

        const validators = {
            name: value => {
                const normalized = String(value || "").trim();
                if (!normalized) return "Informe seu nome.";
                if (normalized.length < 3) return "Use ao menos 3 caracteres no nome.";
                return "";
            },
            email: value => {
                const normalized = String(value || "").trim();
                if (!normalized) return "Informe seu email.";
                const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
                return valid ? "" : "Digite um email valido.";
            },
            subject: value => {
                const normalized = String(value || "").trim();
                if (!normalized) return "Informe o assunto.";
                if (normalized.length < 4) return "Use ao menos 4 caracteres no assunto.";
                return "";
            },
            message: value => {
                const normalized = String(value || "").trim();
                if (!normalized) return "Escreva sua mensagem.";
                if (normalized.length < 20) return "Descreva com ao menos 20 caracteres.";
                return "";
            },
            consent: value => {
                return value ? "" : "Voce precisa autorizar o envio dos dados.";
            }
        };

        restoreContactDraft(fields);
        const updateCounter = () => {
            if (counter) {
                counter.textContent = `${messageField.value.length}/1200 caracteres`;
            }
        };

        updateCounter();
        messageField.addEventListener("input", updateCounter);

        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            const eventName = fieldName === "consent" ? "change" : "blur";
            field.addEventListener(eventName, () => validateField(fieldName));
        });

        const persistDraft = debounce(() => {
            persistContactDraft({
                name: nameField.value,
                email: emailField.value,
                subject: subjectField.value,
                message: messageField.value,
                consent: consentField.checked
            });
        }, 220);

        [nameField, emailField, subjectField, messageField].forEach(field => {
            field.addEventListener("input", persistDraft);
        });
        consentField.addEventListener("change", persistDraft);

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const allValid = Object.keys(fields).every(validateField);
            if (!feedback) {
                return;
            }

            if (!allValid) {
                setFeedback("error", "Revise os campos destacados para continuar.");
                return;
            }

            const payload = {
                name: nameField.value.trim(),
                email: emailField.value.trim(),
                subject: subjectField.value.trim(),
                message: messageField.value.trim(),
                source: "portfolio-site",
                website: ""
            };

            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = true;
                submitButton.textContent = "Enviando...";
            }

            try {
                if (state.dataSource === "fallback") {
                    throw new Error("API offline");
                }

                const idempotencyKey = buildContactIdempotencyKey(payload);
                await fetchJson(`${API_BASE}/contacts`, {
                    method: "POST",
                    headers: {
                        "Idempotency-Key": idempotencyKey
                    },
                    body: JSON.stringify(payload)
                });

                setFeedback("success", "Mensagem enviada com sucesso. Retornarei em breve.");
                form.reset();
                updateCounter();
                clearAllErrors();
                clearContactDraft();
            } catch (error) {
                if (error.code === "DUPLICATE_CONTACT") {
                    setFeedback("error", "Mensagem duplicada detectada. Aguarde um pouco antes de reenviar.");
                } else if (error.code === "VALIDATION_ERROR") {
                    setFeedback("error", "Os dados enviados nao passaram na validacao da API.");
                } else {
                    const mailtoHref = buildMailtoLink(payload);
                    setFeedback("error", "API indisponivel. Use o envio manual por email.", mailtoHref);
                }
            } finally {
                if (submitButton instanceof HTMLButtonElement) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Enviar mensagem";
                }
            }
        });

        function validateField(fieldName) {
            const field = fields[fieldName];
            const value = fieldName === "consent" ? field.checked : field.value;
            const errorMessage = validators[fieldName](value);
            setFieldError(fieldName, errorMessage);
            return !errorMessage;
        }

        function setFieldError(fieldName, message) {
            const field = fields[fieldName];
            const slot = form.querySelector(`[data-error-for="${fieldName}"]`);
            if (!slot) {
                return;
            }

            slot.textContent = message;

            if (message) {
                field.setAttribute("aria-invalid", "true");
            } else {
                field.removeAttribute("aria-invalid");
            }
        }

        function clearAllErrors() {
            Object.keys(fields).forEach(fieldName => setFieldError(fieldName, ""));
        }

        function setFeedback(type, text, actionHref = "") {
            feedback.classList.remove("is-success", "is-error");
            feedback.classList.add(type === "success" ? "is-success" : "is-error");
            feedback.textContent = text;

            if (actionHref) {
                const link = document.createElement("a");
                link.href = actionHref;
                link.textContent = " Abrir aplicativo de email";
                feedback.append(link);
            }
        }

        function restoreContactDraft(currentFields) {
            const draft = readContactDraft();
            if (!draft) {
                return;
            }

            currentFields.name.value = String(draft.name || "").slice(0, 120);
            currentFields.email.value = String(draft.email || "").slice(0, 120);
            currentFields.subject.value = String(draft.subject || "").slice(0, 120);
            currentFields.message.value = String(draft.message || "").slice(0, 1200);
            currentFields.consent.checked = Boolean(draft.consent);
        }
    }

    function initializeCopyEmail() {
        const button = document.getElementById("copy-email");
        const feedback = document.querySelector(".copy-feedback");

        if (!(button instanceof HTMLButtonElement) || !feedback) {
            return;
        }

        button.addEventListener("click", async () => {
            const email = button.getAttribute("data-email") || "";
            if (!email) {
                return;
            }

            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(email);
                } else {
                    legacyCopyToClipboard(email);
                }

                feedback.classList.remove("is-error");
                feedback.classList.add("is-success");
                feedback.textContent = "Email copiado para a area de transferencia.";
            } catch (_error) {
                feedback.classList.remove("is-success");
                feedback.classList.add("is-error");
                feedback.textContent = "Nao foi possivel copiar automaticamente.";
            }
        });
    }

    function setApiStatus(status, text) {
        const badge = document.getElementById("api-health");
        if (!badge) {
            return;
        }

        badge.classList.remove("status-chip--loading", "status-chip--ok", "status-chip--offline");

        if (status === "ok") {
            badge.classList.add("status-chip--ok");
        } else if (status === "offline") {
            badge.classList.add("status-chip--offline");
        } else {
            badge.classList.add("status-chip--loading");
        }

        badge.textContent = text;
    }

    function setProjectGridBusyState(isBusy) {
        const grid = document.getElementById("project-grid");
        if (!grid) {
            return;
        }

        grid.setAttribute("aria-busy", String(Boolean(isBusy)));
    }

    async function fetchJson(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 6500);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    Accept: "application/json",
                    ...(options.body ? { "Content-Type": "application/json" } : {}),
                    ...(options.headers || {})
                },
                signal: controller.signal
            });

            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await response.json() : null;

            if (!response.ok) {
                const error = new Error(data?.error?.message || `Erro HTTP ${response.status}`);
                error.status = response.status;
                error.code = data?.error?.code;
                throw error;
            }

            return data;
        } finally {
            window.clearTimeout(timeoutId);
        }
    }

    function buildMailtoLink(payload) {
        const subject = encodeURIComponent(`Contato via portfolio - ${payload.subject}`);
        const body = encodeURIComponent(
            `Nome: ${payload.name}\nEmail: ${payload.email}\nAssunto: ${payload.subject}\n\nMensagem:\n${payload.message}`
        );

        return `mailto:matheussiqueirahub@gmail.com?subject=${subject}&body=${body}`;
    }

    function buildContactIdempotencyKey(payload) {
        const bucket = Math.floor(Date.now() / (1000 * 60 * 30));
        const canonical = normalize([
            payload.name,
            payload.email,
            payload.subject,
            payload.message
        ].join("|"));

        let hash = 2166136261;
        for (let index = 0; index < canonical.length; index += 1) {
            hash ^= canonical.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }

        const digest = Math.abs(hash >>> 0).toString(36);
        return `contact-${bucket}-${digest}`;
    }

    function normalizeProject(project, index = 0) {
        const normalizedTags = Array.isArray(project.tags)
            ? project.tags.map(item => sanitizeToken(item)).filter(Boolean)
            : [];

        const normalizedStack = Array.isArray(project.stack)
            ? project.stack.map(item => sanitizeText(item)).filter(Boolean)
            : [];

        return {
            id: sanitizeToken(project.id || `project-${index + 1}`) || `project-${index + 1}`,
            title: sanitizeText(project.title || "Projeto sem titulo"),
            summary: sanitizeText(project.summary || "Sem resumo disponivel."),
            impact: sanitizeText(project.impact || "Impacto nao informado."),
            year: Number(project.year) || new Date().getFullYear(),
            tags: normalizedTags,
            stack: normalizedStack,
            url: sanitizeUrl(project.url)
        };
    }

    function sanitizeUrl(url) {
        const value = String(url || "").trim();
        if (!value) {
            return "#";
        }

        try {
            const parsed = new URL(value, window.location.href);
            return parsed.href;
        } catch (_error) {
            return "#";
        }
    }

    function sanitizeToken(value) {
        return sanitizeText(value)
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .trim();
    }

    function sanitizeText(value) {
        return String(value || "")
            .replace(/<[^>]*>/g, "")
            .replace(/[\u0000-\u001F\u007F]/g, "")
            .trim();
    }

    function formatTag(tag) {
        const dictionary = {
            dados: "Dados",
            frontend: "Frontend",
            backend: "Backend",
            python: "Python",
            iot: "IoT"
        };

        return dictionary[tag] || String(tag || "").replace(/-/g, " ");
    }

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function tokenizeRecommendationValue(value) {
        return normalize(value)
            .split(/[,\s]+/)
            .map(item => item.trim())
            .filter(token => token.length >= 2)
            .slice(0, 12);
    }

    function debounce(callback, delayMs) {
        let timer = null;

        return value => {
            if (timer) {
                clearTimeout(timer);
            }

            timer = window.setTimeout(() => callback(value), delayMs);
        };
    }

    function loadFavoriteIds() {
        const raw = safeStorageGet(FAVORITES_STORAGE_KEY);

        if (!raw) {
            return new Set();
        }

        try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return new Set();
            }

            return new Set(parsed.map(value => sanitizeToken(value)).filter(Boolean));
        } catch (_error) {
            return new Set();
        }
    }

    function loadRecentProjectIds() {
        const raw = safeStorageGet(RECENT_PROJECTS_STORAGE_KEY);

        if (!raw) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed
                .map(value => sanitizeToken(value))
                .filter(Boolean)
                .slice(0, 5);
        } catch (_error) {
            return [];
        }
    }

    function persistFavoriteIds(favoritesSet) {
        try {
            safeStorageSet(FAVORITES_STORAGE_KEY, JSON.stringify([...favoritesSet]));
        } catch (_error) {
            // ignore storage errors
        }
    }

    function persistRecentProjectIds(recentIds) {
        try {
            safeStorageSet(RECENT_PROJECTS_STORAGE_KEY, JSON.stringify(recentIds.slice(0, 5)));
        } catch (_error) {
            // ignore storage errors
        }
    }

    function persistContactDraft(payload) {
        try {
            safeStorageSet(CONTACT_DRAFT_STORAGE_KEY, JSON.stringify(payload));
        } catch (_error) {
            // ignore storage errors
        }
    }

    function readContactDraft() {
        const raw = safeStorageGet(CONTACT_DRAFT_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") {
                return null;
            }
            return parsed;
        } catch (_error) {
            return null;
        }
    }

    function clearContactDraft() {
        try {
            window.localStorage.removeItem(CONTACT_DRAFT_STORAGE_KEY);
        } catch (_error) {
            // ignore storage errors
        }
    }

    function safeStorageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (_error) {
            return null;
        }
    }

    function safeStorageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (_error) {
            // ignore storage errors
        }
    }

    function legacyCopyToClipboard(value) {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";

        document.body.append(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
    }
})();
