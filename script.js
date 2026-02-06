(() => {
    "use strict";

    const PROJECTS = [
        {
            id: "ferias",
            title: "Sistema de Ferias - Prefeitura de Jaboatao",
            summary: "Plataforma para solicitacao, aprovacao e controle de ferias com trilha de auditoria.",
            impact: "Padroniza aprovacao gerencial e reduz gargalo operacional em RH.",
            year: 2025,
            stack: ["Node.js", "Prisma", "PostgreSQL", "JavaScript"],
            tags: ["backend", "dados"],
            url: "https://github.com/matheussiqueirahub/backsist-ferias"
        },
        {
            id: "aria",
            title: "Projeto Aria - A3",
            summary: "Implementacao de ambiente no Raspberry Pi com automacoes para setup e manutencao.",
            impact: "Acelera configuracao de hardware low-cost com scripts reprodutiveis.",
            year: 2024,
            stack: ["Linux", "Bash", "Raspberry Pi"],
            tags: ["iot", "backend"],
            url: "https://github.com/matheussiqueirahub/Projeto_Aria"
        },
        {
            id: "aurora",
            title: "Banco Aurora",
            summary: "Sistema bancario em CLI com autenticacao, transacoes e persistencia local.",
            impact: "Consolida fundamentos de regra de negocio e modelagem transacional.",
            year: 2024,
            stack: ["Python", "Typer"],
            tags: ["python", "backend"],
            url: "https://github.com/matheussiqueirahub/banco_aurora"
        },
        {
            id: "hotelaria",
            title: "Hotelaria",
            summary: "Aplicacao para reservas, hospedes e operacao interna com POO.",
            impact: "Melhora previsibilidade de processo e controle de disponibilidade.",
            year: 2023,
            stack: ["Python", "POO"],
            tags: ["python", "backend"],
            url: "https://github.com/matheussiqueirahub/hotelaria"
        },
        {
            id: "dashboard",
            title: "Dashboards Tributarios - SEFAZ",
            summary: "Estruturacao de dashboards para leitura de arrecadacao e performance fiscal.",
            impact: "Aumenta clareza de indicadores para tomada de decisao estrategica.",
            year: 2026,
            stack: ["Power BI", "SQL", "DAX"],
            tags: ["dados"],
            url: "https://github.com/matheussiqueirahub"
        },
        {
            id: "portfolio",
            title: "Portfolio Integrado",
            summary: "Refactor de portfolio com design system, acessibilidade e explorador de projetos.",
            impact: "Melhora descoberta de conteudo, conversao de contato e manutenibilidade.",
            year: 2026,
            stack: ["HTML", "CSS", "JavaScript"],
            tags: ["frontend"],
            url: "https://github.com/matheussiqueira-dev/Portfolio-Integrado"
        }
    ];

    const PROJECT_STATE = {
        filter: "todos",
        query: "",
        sort: "relevancia"
    };

    const STORAGE_KEY = "portfolio-theme";
    const URL_PARAM_FILTER = "f";
    const URL_PARAM_QUERY = "q";
    const URL_PARAM_SORT = "s";

    const SORTERS = {
        relevancia: projects => [...projects],
        recentes: projects => [...projects].sort((a, b) => b.year - a.year),
        alfabetica: projects => [...projects].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
    };

    const VALID_FILTERS = new Set(["todos", "dados", "frontend", "backend", "python", "iot"]);
    const VALID_SORTS = new Set(Object.keys(SORTERS));

    let modalController = null;

    document.addEventListener("DOMContentLoaded", () => {
        setCurrentYear();
        initializeThemeToggle();
        initializeNavigation();
        initializeScrollProgress();
        initializeScrollSpy();
        initializeRevealObserver();
        initializeCounters();
        initializeProjectExplorer();
        initializeContactForm();
        initializeCopyEmail();
    });

    function setCurrentYear() {
        const year = document.getElementById("current-year");
        if (year) {
            year.textContent = String(new Date().getFullYear());
        }
    }

    function initializeThemeToggle() {
        const root = document.documentElement;
        const toggle = document.querySelector(".theme-toggle");
        const label = toggle?.querySelector(".theme-toggle__label");

        if (!toggle) {
            return;
        }

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const persisted = safeStorageGet(STORAGE_KEY);
        const initialTheme = persisted || (prefersDark ? "dark" : "light");

        applyTheme(initialTheme);

        toggle.addEventListener("click", () => {
            const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
            safeStorageSet(STORAGE_KEY, nextTheme);
        });

        function applyTheme(theme) {
            root.dataset.theme = theme;
            const isDark = theme === "dark";
            toggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
            if (label) {
                label.textContent = isDark ? "Tema escuro" : "Tema claro";
            }
        }
    }

    function initializeNavigation() {
        const button = document.querySelector(".menu-toggle");
        const menu = document.getElementById("site-nav");

        if (!button || !menu) {
            return;
        }

        const closeMenu = () => {
            button.setAttribute("aria-expanded", "false");
            menu.dataset.open = "false";
        };

        button.addEventListener("click", () => {
            const isOpen = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!isOpen));
            menu.dataset.open = String(!isOpen);
        });

        menu.addEventListener("click", event => {
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

    function initializeScrollProgress() {
        const bar = document.getElementById("scroll-progress-bar");
        if (!bar) {
            return;
        }

        let ticking = false;

        const update = () => {
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const current = Math.max(window.scrollY, 0);
            const percent = documentHeight > 0 ? (current / documentHeight) * 100 : 0;
            bar.style.width = `${Math.min(100, percent)}%`;
            ticking = false;
        };

        const schedule = () => {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(update);
        };

        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        schedule();
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
                return { id, link, section };
            })
            .filter(Boolean);

        if (!entries.length) {
            return;
        }

        const setActive = id => {
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
                observed.forEach(item => {
                    if (item.isIntersecting) {
                        setActive(item.target.id);
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
        const elements = document.querySelectorAll(".reveal");

        if (!elements.length) {
            return;
        }

        if (!window.IntersectionObserver) {
            elements.forEach(el => el.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            observed => {
                observed.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14 }
        );

        elements.forEach(element => observer.observe(element));
    }

    function initializeCounters() {
        const counters = document.querySelectorAll("[data-counter]");
        if (!counters.length) {
            return;
        }

        const numberFormatter = new Intl.NumberFormat("pt-BR");
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const renderStatic = element => {
            const target = Number(element.getAttribute("data-counter")) || 0;
            const prefix = element.getAttribute("data-prefix") || "";
            const suffix = element.getAttribute("data-suffix") || "";
            element.textContent = `${prefix}${numberFormatter.format(target)}${suffix}`;
        };

        if (prefersReducedMotion || !window.IntersectionObserver) {
            counters.forEach(renderStatic);
            return;
        }

        const animate = element => {
            const target = Number(element.getAttribute("data-counter")) || 0;
            const prefix = element.getAttribute("data-prefix") || "";
            const suffix = element.getAttribute("data-suffix") || "";
            const duration = 1200;
            const startedAt = performance.now();

            const tick = now => {
                const progress = Math.min((now - startedAt) / duration, 1);
                const current = Math.round(target * progress);
                element.textContent = `${prefix}${numberFormatter.format(current)}${suffix}`;

                if (progress < 1) {
                    window.requestAnimationFrame(tick);
                }
            };

            window.requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver(
            observed => {
                observed.forEach(entry => {
                    if (entry.isIntersecting) {
                        animate(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );

        counters.forEach(counter => observer.observe(counter));
    }

    function initializeProjectExplorer() {
        const grid = document.getElementById("project-grid");
        const result = document.getElementById("project-result-count");
        const search = document.getElementById("project-search");
        const sortSelect = document.getElementById("project-sort");
        const chips = Array.from(document.querySelectorAll(".chip[data-filter]"));
        const modal = document.getElementById("project-modal");

        if (!grid || !result || !search || !sortSelect || !chips.length || !modal) {
            return;
        }

        hydrateStateFromUrl();

        search.value = PROJECT_STATE.query;
        sortSelect.value = PROJECT_STATE.sort;
        updateChipState(chips, PROJECT_STATE.filter);

        renderProjects();

        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                PROJECT_STATE.filter = chip.dataset.filter || "todos";
                updateChipState(chips, PROJECT_STATE.filter);
                syncStateToUrl();
                renderProjects();
            });
        });

        const handleSearch = debounce(value => {
            PROJECT_STATE.query = value;
            syncStateToUrl();
            renderProjects();
        }, 140);

        search.addEventListener("input", event => {
            handleSearch((event.target.value || "").trim());
        });

        sortSelect.addEventListener("change", event => {
            const nextSort = event.target.value;
            PROJECT_STATE.sort = VALID_SORTS.has(nextSort) ? nextSort : "relevancia";
            syncStateToUrl();
            renderProjects();
        });

        grid.addEventListener("click", event => {
            if (!(event.target instanceof HTMLElement)) {
                return;
            }

            const detailsButton = event.target.closest("[data-project-id]");
            if (!detailsButton) {
                return;
            }

            const id = detailsButton.getAttribute("data-project-id");
            const project = PROJECTS.find(item => item.id === id);
            if (!project) {
                return;
            }

            openProjectModal(modal, project, detailsButton);
        });

        modal.addEventListener("click", event => {
            if (event.target instanceof HTMLElement && event.target.closest("[data-modal-close]")) {
                closeProjectModal(modal);
            }
        });

        function renderProjects() {
            const filtered = getFilteredProjects();
            const sorted = SORTERS[PROJECT_STATE.sort](filtered);

            grid.textContent = "";

            if (!sorted.length) {
                const empty = document.createElement("article");
                empty.className = "project-empty";
                empty.textContent = "Nenhum projeto encontrado para o filtro atual. Ajuste os criterios e tente novamente.";
                grid.append(empty);
                result.textContent = "0 projetos encontrados.";
                return;
            }

            const fragment = document.createDocumentFragment();
            sorted.forEach(project => {
                fragment.append(buildProjectCard(project));
            });

            grid.append(fragment);
            result.textContent = `${sorted.length} projeto(s) encontrado(s).`;
        }

        function getFilteredProjects() {
            const query = normalize(PROJECT_STATE.query);

            return PROJECTS.filter(project => {
                const filterMatch = PROJECT_STATE.filter === "todos" || project.tags.includes(PROJECT_STATE.filter);
                if (!filterMatch) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                const searchable = normalize(
                    [project.title, project.summary, project.impact, project.stack.join(" "), project.tags.join(" ")].join(" ")
                );

                return searchable.includes(query);
            });
        }

        function hydrateStateFromUrl() {
            const params = new URLSearchParams(window.location.search);
            const filter = params.get(URL_PARAM_FILTER) || "todos";
            const query = params.get(URL_PARAM_QUERY) || "";
            const sort = params.get(URL_PARAM_SORT) || "relevancia";

            PROJECT_STATE.filter = VALID_FILTERS.has(filter) ? filter : "todos";
            PROJECT_STATE.query = query;
            PROJECT_STATE.sort = VALID_SORTS.has(sort) ? sort : "relevancia";
        }

        function syncStateToUrl() {
            const params = new URLSearchParams(window.location.search);

            params.delete(URL_PARAM_FILTER);
            params.delete(URL_PARAM_QUERY);
            params.delete(URL_PARAM_SORT);

            if (PROJECT_STATE.filter !== "todos") {
                params.set(URL_PARAM_FILTER, PROJECT_STATE.filter);
            }

            if (PROJECT_STATE.query) {
                params.set(URL_PARAM_QUERY, PROJECT_STATE.query);
            }

            if (PROJECT_STATE.sort !== "relevancia") {
                params.set(URL_PARAM_SORT, PROJECT_STATE.sort);
            }

            const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
            window.history.replaceState({}, "", next);
        }
    }

    function buildProjectCard(project) {
        const card = document.createElement("article");
        card.className = "project-card reveal is-visible";

        const title = document.createElement("h3");
        title.textContent = project.title;

        const summary = document.createElement("p");
        summary.textContent = project.summary;

        const stack = document.createElement("p");
        stack.className = "project-card__stack";
        stack.append(
            createStrongLabel("Stack:"),
            document.createTextNode(` ${project.stack.join(" | ")}`)
        );

        const impact = document.createElement("p");
        impact.className = "project-card__impact";
        impact.append(
            createStrongLabel("Impacto:"),
            document.createTextNode(` ${project.impact}`)
        );

        const tagList = document.createElement("ul");
        tagList.className = "project-card__tags";
        project.tags.forEach(tag => {
            const li = document.createElement("li");
            li.textContent = getTagLabel(tag);
            tagList.append(li);
        });

        const actions = document.createElement("div");
        actions.className = "project-card__actions";

        const repoLink = document.createElement("a");
        repoLink.className = "project-card__link";
        repoLink.href = project.url;
        repoLink.target = "_blank";
        repoLink.rel = "noopener noreferrer";
        repoLink.textContent = "Repositorio";

        const details = document.createElement("button");
        details.className = "project-card__details";
        details.type = "button";
        details.setAttribute("data-project-id", project.id);
        details.textContent = "Detalhes";

        actions.append(repoLink, details);
        card.append(title, summary, stack, impact, tagList, actions);

        return card;
    }

    function updateChipState(chips, activeFilter) {
        chips.forEach(chip => {
            const isActive = chip.dataset.filter === activeFilter;
            chip.classList.toggle("is-active", isActive);
            chip.setAttribute("aria-pressed", String(isActive));
        });
    }

    function getTagLabel(tag) {
        const map = {
            dados: "Dados",
            frontend: "Frontend",
            backend: "Backend",
            python: "Python",
            iot: "IoT"
        };

        return map[tag] || tag;
    }

    function createStrongLabel(text) {
        const strong = document.createElement("strong");
        strong.textContent = text;
        return strong;
    }

    function openProjectModal(modal, project, triggerElement) {
        const title = document.getElementById("modal-title");
        const summary = document.getElementById("modal-summary");
        const impact = document.getElementById("modal-impact");
        const stack = document.getElementById("modal-stack");
        const link = document.getElementById("modal-link");

        if (!title || !summary || !impact || !stack || !link) {
            return;
        }

        title.textContent = project.title;
        summary.textContent = project.summary;
        impact.textContent = `Impacto: ${project.impact}`;
        stack.textContent = `Stack: ${project.stack.join(" | ")}`;
        link.href = project.url;

        modal.hidden = false;
        document.body.style.overflow = "hidden";

        modalController?.abort();
        modalController = new AbortController();

        const focusable = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (first instanceof HTMLElement) {
            first.focus();
        }

        document.addEventListener(
            "keydown",
            event => {
                if (event.key === "Escape") {
                    closeProjectModal(modal, triggerElement);
                    return;
                }

                if (event.key !== "Tab" || !focusable.length) {
                    return;
                }

                const active = document.activeElement;

                if (event.shiftKey && active === first) {
                    event.preventDefault();
                    if (last instanceof HTMLElement) {
                        last.focus();
                    }
                } else if (!event.shiftKey && active === last) {
                    event.preventDefault();
                    if (first instanceof HTMLElement) {
                        first.focus();
                    }
                }
            },
            { signal: modalController.signal }
        );
    }

    function closeProjectModal(modal, focusTarget) {
        modal.hidden = true;
        document.body.style.overflow = "";
        modalController?.abort();

        if (focusTarget instanceof HTMLElement) {
            focusTarget.focus();
        }
    }

    function initializeContactForm() {
        const form = document.getElementById("contact-form");
        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        const feedback = form.querySelector(".form-feedback");
        const counter = form.querySelector("#message-counter");

        const nameField = form.elements.namedItem("name");
        const emailField = form.elements.namedItem("email");
        const messageField = form.elements.namedItem("message");

        if (!(nameField instanceof HTMLInputElement) || !(emailField instanceof HTMLInputElement) || !(messageField instanceof HTMLTextAreaElement)) {
            return;
        }

        const fields = {
            name: nameField,
            email: emailField,
            message: messageField
        };

        const validators = {
            name: value => {
                const trimmed = value.trim();
                if (!trimmed) {
                    return "Informe seu nome.";
                }
                if (trimmed.length < 3) {
                    return "Use pelo menos 3 caracteres no nome.";
                }
                return "";
            },
            email: value => {
                const trimmed = value.trim();
                if (!trimmed) {
                    return "Informe seu email.";
                }
                const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
                return valid ? "" : "Digite um email valido.";
            },
            message: value => {
                const trimmed = value.trim();
                if (!trimmed) {
                    return "Escreva uma mensagem.";
                }
                if (trimmed.length < 25) {
                    return "Descreva com pelo menos 25 caracteres para contexto minimo.";
                }
                return "";
            }
        };

        const updateCounter = () => {
            if (counter) {
                counter.textContent = `${messageField.value.length}/600 caracteres`;
            }
        };

        updateCounter();

        messageField.addEventListener("input", updateCounter);

        Object.keys(fields).forEach(fieldName => {
            fields[fieldName].addEventListener("blur", () => validateField(fieldName));
        });

        form.addEventListener("submit", event => {
            event.preventDefault();

            const allValid = Object.keys(fields).every(validateField);
            if (!feedback) {
                return;
            }

            if (!allValid) {
                feedback.classList.remove("is-success");
                feedback.classList.add("is-error");
                feedback.textContent = "Corrija os campos destacados para continuar.";
                return;
            }

            const name = nameField.value.trim();
            const email = emailField.value.trim();
            const message = messageField.value.trim();

            const subject = encodeURIComponent(`Contato via portfolio - ${name}`);
            const body = encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`);
            const mailtoHref = `mailto:matheussiqueirahub@gmail.com?subject=${subject}&body=${body}`;

            feedback.classList.remove("is-error");
            feedback.classList.add("is-success");
            feedback.textContent = "Mensagem validada com sucesso. ";

            const anchor = document.createElement("a");
            anchor.href = mailtoHref;
            anchor.textContent = "Abrir aplicativo de email";
            feedback.append(anchor);

            form.reset();
            updateCounter();
            clearAllErrors();
        });

        function validateField(fieldName) {
            const field = fields[fieldName];
            const error = validators[fieldName](field.value);
            setError(fieldName, error);
            return !error;
        }

        function setError(fieldName, message) {
            const field = fields[fieldName];
            const errorSlot = form.querySelector(`[data-error-for="${fieldName}"]`);
            if (!errorSlot) {
                return;
            }

            errorSlot.textContent = message;

            if (message) {
                field.setAttribute("aria-invalid", "true");
            } else {
                field.removeAttribute("aria-invalid");
            }
        }

        function clearAllErrors() {
            Object.keys(fields).forEach(fieldName => setError(fieldName, ""));
        }
    }

    function initializeCopyEmail() {
        const button = document.querySelector("[data-copy-email]");
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
                    legacyCopy(email);
                }

                feedback.classList.remove("is-error");
                feedback.classList.add("is-success");
                feedback.textContent = "Email copiado para a area de transferencia.";
            } catch (_error) {
                feedback.classList.remove("is-success");
                feedback.classList.add("is-error");
                feedback.textContent = "Nao foi possivel copiar automaticamente. Use o endereco exibido acima.";
            }
        });
    }

    function legacyCopy(value) {
        const input = document.createElement("textarea");
        input.value = value;
        input.setAttribute("readonly", "true");
        input.style.position = "absolute";
        input.style.left = "-9999px";

        document.body.append(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
    }

    function normalize(value) {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function debounce(callback, delay) {
        let timerId = null;
        return value => {
            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = window.setTimeout(() => callback(value), delay);
        };
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
            // ignore storage failures
        }
    }
})();
