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
        const normalizedTag = normalizeText(tag).toLowerCase();

        let projects = await this.projectsRepository.list();

        if (status !== "all") {
            projects = projects.filter(project => project.status === status);
        }

        if (normalizedTag) {
            projects = projects.filter(project =>
                Array.isArray(project.tags) &&
                project.tags.some(item => String(item).toLowerCase() === normalizedTag)
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
