const { z } = require("zod");

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128)
});

const projectCreateSchema = z.object({
    title: z.string().min(3).max(120),
    summary: z.string().min(10).max(300),
    impact: z.string().min(10).max(300),
    year: z.number().int().gte(2000).lte(2100),
    tags: z.array(z.string().min(2).max(30)).min(1),
    stack: z.array(z.string().min(1).max(40)).min(1),
    status: z.enum(["draft", "published"]).default("draft")
});

const projectUpdateSchema = projectCreateSchema.partial();

const projectQuerySchema = z.object({
    search: z.string().max(100).optional(),
    tag: z.string().max(30).optional(),
    sort: z.enum(["recent", "alpha"]).optional(),
    page: z.coerce.number().int().gte(1).optional(),
    limit: z.coerce.number().int().gte(1).lte(50).optional(),
    status: z.enum(["all", "draft", "published"]).optional()
});

const projectInsightsQuerySchema = z.object({
    status: z.enum(["all", "draft", "published"]).optional()
});

const idParamSchema = z.object({
    id: z.string().min(5).max(100)
});

const contactCreateSchema = z.object({
    name: z.string().min(3).max(120),
    email: z.string().email(),
    subject: z.string().min(3).max(120),
    message: z.string().min(20).max(1200),
    source: z.string().min(2).max(50).optional(),
    website: z.string().max(120).optional().default("")
});

const contactListQuerySchema = z.object({
    status: z.enum(["all", "new", "in_progress", "resolved"]).optional(),
    page: z.coerce.number().int().gte(1).optional(),
    limit: z.coerce.number().int().gte(1).lte(100).optional()
});

const contactStatusUpdateSchema = z.object({
    status: z.enum(["new", "in_progress", "resolved"])
});

module.exports = {
    loginSchema,
    projectCreateSchema,
    projectUpdateSchema,
    projectQuerySchema,
    projectInsightsQuerySchema,
    idParamSchema,
    contactCreateSchema,
    contactListQuerySchema,
    contactStatusUpdateSchema
};
