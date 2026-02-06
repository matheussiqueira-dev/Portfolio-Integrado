<<<<<<< HEAD
const PROJECTS = [
    {
        title: "Sistema de Ferias - Prefeitura de Jaboatao",
        description: "Fluxo de solicitacao e aprovacao de ferias com autenticacao, permissoes e painel administrativo.",
        impact: "Reduz burocracia operacional com trilha clara de aprovacoes.",
        stack: ["Node.js", "Prisma", "PostgreSQL", "JavaScript"],
        tags: ["backend", "dados"],
        url: "https://github.com/matheussiqueirahub/backsist-ferias"
    },
    {
        title: "Projeto Aria - A3",
        description: "Ambiente em Raspberry Pi com RetroPie, VPN e scripts para automacoes de configuracao e manutencao.",
        impact: "Padroniza setup tecnico e facilita reproducao em hardware de baixo custo.",
        stack: ["Linux", "Bash", "Raspberry Pi"],
        tags: ["iot", "backend"],
        url: "https://github.com/matheussiqueirahub/Projeto_Aria"
    },
    {
        title: "Banco Aurora",
        description: "Sistema bancario CLI com operacoes de conta, controle de saldo e persistencia de dados.",
        impact: "Consolida fundamentos de regras de negocio e modelagem transacional.",
        stack: ["Python", "Typer"],
        tags: ["python", "backend"],
        url: "https://github.com/matheussiqueirahub/banco_aurora"
    },
    {
        title: "Hotelaria",
        description: "Aplicacao de gestao de reservas, hospedes e funcionarios baseada em orientacao a objetos.",
        impact: "Estrutura processos de operacao com entidade e fluxo de uso bem definido.",
        stack: ["Python", "POO"],
        tags: ["python", "backend"],
        url: "https://github.com/matheussiqueirahub/hotelaria"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
    initializeTheme();
    initializeNavigation();
    initializeScrollProgress();
    initializeScrollSpy();
    initializeRevealOnScroll();
    initializeCounters();
    initializeProjectExplorer();
    initializeContactForm();
    initializeCopyEmail();
});

function setCurrentYear() {
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }
}

function initializeTheme() {
    const root = document.documentElement;
    const toggleButton = document.querySelector(".theme-toggle");
    const label = toggleButton?.querySelector(".theme-toggle__label");
    const key = "portfolio-theme";

    if (!toggleButton) {
        return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem(key);
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    applyTheme(initialTheme, false);

    toggleButton.addEventListener("click", () => {
        const currentTheme = root.dataset.theme === "dark" ? "dark" : "light";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme, true);
    });

    function applyTheme(theme, persist) {
        root.dataset.theme = theme;
        if (persist) {
            localStorage.setItem(key, theme);
        }

        const isDark = theme === "dark";
        toggleButton.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
        if (label) {
            label.textContent = isDark ? "Tema escuro" : "Tema claro";
        }
    }
}

function initializeNavigation() {
    const toggleButton = document.querySelector(".menu-toggle");
    const navList = document.getElementById("menu-principal");

    if (!toggleButton || !navList) {
        return;
    }

    const closeMenu = () => {
        toggleButton.setAttribute("aria-expanded", "false");
        navList.dataset.open = "false";
    };

    toggleButton.addEventListener("click", () => {
        const isOpen = toggleButton.getAttribute("aria-expanded") === "true";
        toggleButton.setAttribute("aria-expanded", String(!isOpen));
        navList.dataset.open = String(!isOpen);
    });

    navList.addEventListener("click", event => {
        if (event.target instanceof HTMLElement && event.target.tagName === "A") {
            closeMenu();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
=======
document.addEventListener("DOMContentLoaded", () => {
    initializeThemeToggle();
    initializeNavigation();
    initializeTypingEffect();
    initializeSmoothScroll();
    initializeFormValidation();
    injectCurrentYear();
});

function initializeThemeToggle() {
    const toggleButton = document.querySelector(".theme-toggle");
    const icon = toggleButton.querySelector("i");
    const storedTheme = localStorage.getItem("preferred-theme");

    if (storedTheme === "light") {
        document.body.setAttribute("data-theme", "light");
        icon.classList.replace("fa-moon", "fa-sun");
    }

    toggleButton.addEventListener("click", () => {
        const isLight = document.body.getAttribute("data-theme") === "light";
        if (isLight) {
            document.body.removeAttribute("data-theme");
            localStorage.setItem("preferred-theme", "dark");
            icon.classList.replace("fa-sun", "fa-moon");
        } else {
            document.body.setAttribute("data-theme", "light");
            localStorage.setItem("preferred-theme", "light");
            icon.classList.replace("fa-moon", "fa-sun");
        }
    });
}

function initializeNavigation() {
    const toggleButton = document.querySelector(".nav-toggle");
    const navList = document.querySelector(".main-nav ul");

    toggleButton.addEventListener("click", () => {
        const expanded = toggleButton.getAttribute("aria-expanded") === "true";
        toggleButton.setAttribute("aria-expanded", String(!expanded));
        navList.dataset.open = String(!expanded);
        toggleButton.querySelector("i").classList.toggle("fa-bars");
        toggleButton.querySelector("i").classList.toggle("fa-xmark");
    });

    navList.addEventListener("click", event => {
        if (event.target.matches("a")) {
            toggleButton.setAttribute("aria-expanded", "false");
            navList.dataset.open = "false";
            const icon = toggleButton.querySelector("i");
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
>>>>>>> 3d153446dd881238f337b7a6a55ec64bfca851a3
        }
    });
}

<<<<<<< HEAD
function initializeScrollProgress() {
    const progressBar = document.getElementById("scroll-progress-bar");
    if (!progressBar) {
        return;
    }

    let running = false;

    const updateProgress = () => {
        const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
        const currentY = Math.max(window.scrollY, 0);
        const percentage = maxScrollable > 0 ? (currentY / maxScrollable) * 100 : 0;
        progressBar.style.width = `${Math.min(100, percentage)}%`;
        running = false;
    };

    const requestUpdate = () => {
        if (!running) {
            running = true;
            window.requestAnimationFrame(updateProgress);
        }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();
}

function initializeScrollSpy() {
    const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
    const sections = navLinks
        .map(link => {
            const id = link.getAttribute("href")?.slice(1);
            const section = id ? document.getElementById(id) : null;
            return section ? { id, link, section } : null;
        })
        .filter(Boolean);

    if (!sections.length) {
        return;
    }

    const setActiveLink = targetId => {
        sections.forEach(item => {
            if (!item) {
                return;
            }

            if (item.id === targetId) {
                item.link.setAttribute("aria-current", "true");
            } else {
                item.link.removeAttribute("aria-current");
            }
        });
    };

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        },
        {
            rootMargin: "-45% 0px -45% 0px",
            threshold: 0.01
        }
    );

    sections.forEach(item => {
        if (item) {
            observer.observe(item.section);
        }
    });
}

function initializeRevealOnScroll() {
    const elements = document.querySelectorAll(".reveal");

    if (!elements.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        elements.forEach(element => element.classList.add("is-visible"));
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
        {
            threshold: 0.12
        }
    );

    elements.forEach(element => observer.observe(element));
}

function initializeCounters() {
    const counters = document.querySelectorAll("[data-counter]");

    if (!counters.length) {
        return;
    }

    const formatter = new Intl.NumberFormat("pt-BR");

    const animateCounter = element => {
        const target = Number(element.getAttribute("data-counter"));
        const suffix = element.getAttribute("data-suffix") || "";
        const prefix = element.getAttribute("data-prefix") || "";
        const duration = 1200;
        const startTime = performance.now();

        const draw = now => {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.round(target * progress);
            element.textContent = `${prefix}${formatter.format(value)}${suffix}`;

            if (progress < 1) {
                window.requestAnimationFrame(draw);
            }
        };

        window.requestAnimationFrame(draw);
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
        { threshold: 0.5 }
    );

    counters.forEach(counter => observer.observe(counter));
}

function initializeProjectExplorer() {
    const grid = document.getElementById("project-grid");
    const resultsLabel = document.getElementById("project-result-count");
    const searchInput = document.getElementById("project-search");
    const filterButtons = Array.from(document.querySelectorAll(".chip[data-filter]"));

    if (!grid || !resultsLabel || !searchInput || !filterButtons.length) {
        return;
    }

    const state = {
        filter: "todos",
        query: ""
    };

    const normalized = text =>
        text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    const filterProjects = () => {
        const query = normalized(state.query.trim());

        return PROJECTS.filter(project => {
            const isFilterMatch = state.filter === "todos" || project.tags.includes(state.filter);
            if (!isFilterMatch) {
                return false;
            }

            if (!query) {
                return true;
            }

            const haystack = normalized(
                [project.title, project.description, project.impact, project.stack.join(" "), project.tags.join(" ")].join(" ")
            );

            return haystack.includes(query);
        });
    };

    const getTagLabel = tag => {
        const map = {
            dados: "Dados",
            backend: "Backend",
            python: "Python",
            iot: "IoT"
        };

        return map[tag] || tag;
    };

    const render = () => {
        const visibleProjects = filterProjects();

        if (!visibleProjects.length) {
            grid.innerHTML = '<div class="project-empty">Nenhum projeto encontrado para o filtro atual. Tente ajustar os criterios de busca.</div>';
            resultsLabel.textContent = "0 projetos encontrados.";
            return;
        }

        grid.innerHTML = visibleProjects
            .map(project => {
                const tags = project.tags
                    .map(tag => `<li>${getTagLabel(tag)}</li>`)
                    .join("");

                const stack = project.stack.join(" | ");

                return `
                    <article class="project-card reveal is-visible">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <p class="project-metadata"><strong>Stack:</strong> ${stack}</p>
                        <p class="project-metadata"><strong>Impacto:</strong> ${project.impact}</p>
                        <ul class="project-tags">${tags}</ul>
                        <a class="project-link" href="${project.url}" target="_blank" rel="noopener noreferrer">Ver repositorio</a>
                    </article>
                `;
            })
            .join("");

        resultsLabel.textContent = `${visibleProjects.length} projeto(s) encontrado(s).`;
    };

    const updateActiveFilter = selectedButton => {
        filterButtons.forEach(button => {
            const active = button === selectedButton;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            state.filter = button.dataset.filter || "todos";
            updateActiveFilter(button);
            render();
        });
    });

    const debounce = (callback, wait) => {
        let timeoutId = null;
        return value => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => callback(value), wait);
        };
    };

    const onSearch = debounce(value => {
        state.query = value;
        render();
    }, 160);

    searchInput.addEventListener("input", event => {
        onSearch(event.target.value || "");
    });

    render();
}

function initializeContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) {
        return;
    }

    const feedback = form.querySelector(".form-feedback");
    const emailAddress = "matheussiqueirahub@gmail.com";

    const fields = {
        nome: form.querySelector("#nome"),
        email: form.querySelector("#email"),
        mensagem: form.querySelector("#mensagem")
    };

    const validators = {
        nome: value => {
            if (!value.trim()) {
                return "Informe seu nome.";
            }
            if (value.trim().length < 3) {
                return "Digite um nome com ao menos 3 caracteres.";
            }
            return "";
        },
        email: value => {
            if (!value.trim()) {
                return "Informe seu email.";
            }
            const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            if (!isEmailValid) {
                return "Digite um email valido.";
            }
            return "";
        },
        mensagem: value => {
            if (!value.trim()) {
                return "Descreva sua mensagem.";
            }
            if (value.trim().length < 20) {
                return "A mensagem precisa ter pelo menos 20 caracteres.";
            }
            return "";
        }
    };

    const setFieldError = (fieldName, message) => {
        const field = fields[fieldName];
        const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

        if (!field || !errorElement) {
            return;
        }

        errorElement.textContent = message;
        if (message) {
            field.setAttribute("aria-invalid", "true");
        } else {
            field.removeAttribute("aria-invalid");
        }
    };

    const validateField = fieldName => {
        const field = fields[fieldName];
        if (!field) {
            return true;
        }

        const message = validators[fieldName](field.value);
        setFieldError(fieldName, message);
        return !message;
    };

    Object.keys(fields).forEach(fieldName => {
        fields[fieldName]?.addEventListener("blur", () => {
            validateField(fieldName);
        });
    });
=======
function initializeTypingEffect() {
    const title = document.getElementById("typed-title");
    if (!title) return;

    const text = title.dataset.texto || title.textContent.trim();
    let index = 0;

    title.textContent = "";

    const typeNext = () => {
        if (index <= text.length) {
            title.textContent = text.slice(0, index);
            index += 1;
            setTimeout(typeNext, 90);
        } else {
            setTimeout(() => {
                index = 0;
                title.textContent = "";
                typeNext();
            }, 4200);
        }
    };

    typeNext();
}

function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

function initializeFormValidation() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const feedback = form.querySelector(".form-feedback");
>>>>>>> 3d153446dd881238f337b7a6a55ec64bfca851a3

    form.addEventListener("submit", event => {
        event.preventDefault();

<<<<<<< HEAD
        const isValid = Object.keys(fields).every(validateField);

        if (!feedback) {
            return;
        }

        if (!isValid) {
            feedback.classList.remove("is-success");
            feedback.classList.add("is-error");
            feedback.textContent = "Revise os campos destacados e tente novamente.";
            return;
        }

        const nome = fields.nome?.value.trim() || "";
        const email = fields.email?.value.trim() || "";
        const mensagem = fields.mensagem?.value.trim() || "";

        const subject = encodeURIComponent(`Contato via portfolio - ${nome}`);
        const body = encodeURIComponent(`Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`);
        const mailto = `mailto:${emailAddress}?subject=${subject}&body=${body}`;

        feedback.classList.remove("is-error");
        feedback.classList.add("is-success");
        feedback.innerHTML = `Mensagem validada com sucesso. <a href="${mailto}">Abrir aplicativo de email</a>.`;

        form.reset();
        Object.keys(fields).forEach(fieldName => setFieldError(fieldName, ""));
    });
}

function initializeCopyEmail() {
    const button = document.querySelector("[data-copy-email]");
    const feedback = document.querySelector(".copy-feedback");

    if (!button || !feedback) {
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
                fallbackCopy(email);
            }

            feedback.classList.remove("is-error");
            feedback.classList.add("is-success");
            feedback.textContent = "Email copiado para a area de transferencia.";
        } catch (_error) {
            feedback.classList.remove("is-success");
            feedback.classList.add("is-error");
            feedback.textContent = "Nao foi possivel copiar automaticamente. Use o email exibido acima.";
        }
    });
}

function fallbackCopy(text) {
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.setAttribute("readonly", "true");
    temp.style.position = "absolute";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
=======
        const fields = {
            nome: form.nome,
            email: form.email,
            mensagem: form.mensagem
        };

        let isValid = true;

        if (!fields.nome.value.trim() || fields.nome.value.trim().length < 3) {
            setError(fields.nome, "Informe seu nome completo.");
            isValid = false;
        } else {
            clearError(fields.nome);
        }

        if (!validateEmail(fields.email.value)) {
            setError(fields.email, "Informe um e-mail válido.");
            isValid = false;
        } else {
            clearError(fields.email);
        }

        if (!fields.mensagem.value.trim() || fields.mensagem.value.trim().length < 10) {
            setError(fields.mensagem, "Descreva sua mensagem com pelo menos 10 caracteres.");
            isValid = false;
        } else {
            clearError(fields.mensagem);
        }

        if (isValid) {
            feedback.textContent = "Mensagem pronta para envio. Integre seu serviço favorito (ex: Formspree) para receber os contatos.";
            feedback.classList.remove("error");
            feedback.classList.add("success");
            form.reset();
        } else {
            feedback.textContent = "Corrija os campos destacados antes de enviar.";
            feedback.classList.remove("success");
            feedback.classList.add("error");
        }
    });
}

function setError(field, message) {
    const container = field.closest(".form-field");
    const messageSpan = container.querySelector(".error-message");
    messageSpan.textContent = message;
    field.setAttribute("aria-invalid", "true");
}

function clearError(field) {
    const container = field.closest(".form-field");
    const messageSpan = container.querySelector(".error-message");
    messageSpan.textContent = "";
    field.removeAttribute("aria-invalid");
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function injectCurrentYear() {
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
>>>>>>> 3d153446dd881238f337b7a6a55ec64bfca851a3
}
