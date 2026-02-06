const { AppError } = require("../../common/errors");
const {
    createId,
    normalizeList,
    normalizeText,
    nowIso,
    includesSuspiciousSqlPattern
} = require("../../common/utils");

class ProjectsService {
    constructor({ projectsRepository, cache }) {
        this.projectsRepository = projectsRepository;
        this.cache = cache;
    }

    async list({ search = "", tag = "", sort = "recent", page = 1, limit = 10, status = "published" }) {
        const pageNumber = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(Math.max(Number(limit) || 10, 1), 50);

        const cacheKey = `projects:list:${search}:${tag}:${sort}:${pageNumber}:${perPage}:${status}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const normalizedSearch = normalizeText(search).toLowerCase();
        const normalizedTags = normalizeText(tag)
            .split(",")
            .map(item => item.trim().toLowerCase())
            .filter(Boolean);

        let projects = await this.projectsRepository.list();

        if (status !== "all") {
            projects = projects.filter(project => project.status === status);
        }

        if (normalizedTags.length) {
            projects = projects.filter(project =>
                Array.isArray(project.tags) &&
                project.tags.some(item => normalizedTags.includes(String(item).toLowerCase()))
            );
        }

        if (normalizedSearch) {
            projects = projects.filter(project => {
                const corpus = [project.title, project.summary, project.impact, ...(project.tags || []), ...(project.stack || [])]
                    .join(" ")
                    .toLowerCase();
                return corpus.includes(normalizedSearch);
            });
        }

        if (sort === "alpha") {
            projects = [...projects].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
        } else {
            projects = [...projects].sort((a, b) => Number(b.year) - Number(a.year));
        }

        const total = projects.length;
        const offset = (pageNumber - 1) * perPage;
        const paginated = projects.slice(offset, offset + perPage);

        const response = {
            items: paginated,
            pagination: {
                page: pageNumber,
                limit: perPage,
                total,
                totalPages: Math.max(Math.ceil(total / perPage), 1)
            }
        };

        this.cache.set(cacheKey, response, 4000);
        return response;
    }

    async getTagsSummary({ status = "published" } = {}) {
        const cacheKey = `projects:tags:${status}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        let projects = await this.projectsRepository.list();
        if (status !== "all") {
            projects = projects.filter(project => project.status === status);
        }

        const tags = Object.entries(
            projects.reduce((accumulator, project) => {
                const currentTags = Array.isArray(project.tags) ? project.tags : [];
                currentTags.forEach(tag => {
                    const normalized = String(tag).toLowerCase();
                    accumulator[normalized] = (accumulator[normalized] || 0) + 1;
                });

                return accumulator;
            }, {})
        )
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
            .map(([tag, total]) => ({ tag, total }));

        const response = {
            totalTags: tags.length,
            tags
        };

        this.cache.set(cacheKey, response, 8000);
        return response;
    }

    async getInsights({ status = "published" } = {}) {
        const cacheKey = `projects:insights:${status}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        let projects = await this.projectsRepository.list();
        if (status !== "all") {
            projects = projects.filter(project => project.status === status);
        }

        const byStatus = projects.reduce((acc, project) => {
            const key = String(project.status || "unknown");
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const byTag = projects.reduce((acc, project) => {
            const tags = Array.isArray(project.tags) ? project.tags : [];
            tags.forEach(tag => {
                const normalized = String(tag).toLowerCase();
                acc[normalized] = (acc[normalized] || 0) + 1;
            });
            return acc;
        }, {});

        const byYear = projects.reduce((acc, project) => {
            const year = String(project.year || "unknown");
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {});

        const topStacks = Object.entries(
            projects.reduce((acc, project) => {
                const stack = Array.isArray(project.stack) ? project.stack : [];
                stack.forEach(tech => {
                    const key = String(tech);
                    acc[key] = (acc[key] || 0) + 1;
                });
                return acc;
            }, {})
        )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, total]) => ({ name, total }));

        const insights = {
            total: projects.length,
            byStatus,
            byTag,
            byYear,
            topStacks
        };

        this.cache.set(cacheKey, insights, 8000);
        return insights;
    }

    async getById(id, options = { includeDrafts: false }) {
        const cacheKey = `projects:item:${id}:${options.includeDrafts ? "all" : "published"}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const project = await this.projectsRepository.findById(id);
        if (!project) {
            throw new AppError("Projeto nao encontrado.", 404, "PROJECT_NOT_FOUND");
        }

        if (!options.includeDrafts && project.status !== "published") {
            throw new AppError("Projeto nao encontrado.", 404, "PROJECT_NOT_FOUND");
        }

        this.cache.set(cacheKey, project, 4000);
        return project;
    }

    async create(payload) {
        this.#guardAgainstSuspiciousPayload(payload);

        const createdAt = nowIso();
        const project = {
            id: createId("project"),
            title: normalizeText(payload.title),
            summary: normalizeText(payload.summary),
            impact: normalizeText(payload.impact),
            year: Number(payload.year),
            tags: normalizeList(payload.tags),
            stack: normalizeList(payload.stack),
            status: payload.status || "draft",
            createdAt,
            updatedAt: createdAt
        };

        await this.projectsRepository.create(project);
        this.cache.delByPrefix("projects:");

        return project;
    }

    async update(id, payload) {
        this.#guardAgainstSuspiciousPayload(payload);

        const updated = await this.projectsRepository.updateById(id, project => {
            const next = {
                ...project,
                updatedAt: nowIso()
            };

            if (payload.title !== undefined) next.title = normalizeText(payload.title);
            if (payload.summary !== undefined) next.summary = normalizeText(payload.summary);
            if (payload.impact !== undefined) next.impact = normalizeText(payload.impact);
            if (payload.year !== undefined) next.year = Number(payload.year);
            if (payload.tags !== undefined) next.tags = normalizeList(payload.tags);
            if (payload.stack !== undefined) next.stack = normalizeList(payload.stack);
            if (payload.status !== undefined) next.status = payload.status;

            return next;
        });

        if (!updated) {
            throw new AppError("Projeto nao encontrado.", 404, "PROJECT_NOT_FOUND");
        }

        this.cache.delByPrefix("projects:");
        return updated;
    }

    async remove(id) {
        const removed = await this.projectsRepository.removeById(id);

        if (!removed) {
            throw new AppError("Projeto nao encontrado.", 404, "PROJECT_NOT_FOUND");
        }

        this.cache.delByPrefix("projects:");
        return removed;
    }

    #guardAgainstSuspiciousPayload(payload) {
        const values = Object.values(payload || {});

        for (const value of values) {
            if (typeof value === "string" && includesSuspiciousSqlPattern(value)) {
                throw new AppError("Payload bloqueado por padrao suspeito.", 400, "SUSPICIOUS_PAYLOAD");
            }

            if (Array.isArray(value)) {
                const hasSuspiciousValue = value.some(item => typeof item === "string" && includesSuspiciousSqlPattern(item));
                if (hasSuspiciousValue) {
                    throw new AppError("Payload bloqueado por padrao suspeito.", 400, "SUSPICIOUS_PAYLOAD");
                }
            }
        }
    }
}

module.exports = {
    ProjectsService
};
