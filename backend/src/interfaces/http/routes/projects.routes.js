const express = require("express");
const { validate } = require("../middlewares/validate.middleware");
const { authenticationMiddleware, authorizeRoles } = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../middlewares/async-handler.middleware");
const {
    projectCreateSchema,
    projectUpdateSchema,
    projectQuerySchema,
    projectInsightsQuerySchema,
    projectTagsQuerySchema,
    projectRecommendationsQuerySchema,
    idParamSchema
} = require("../schemas/schemas");

function setPublicCacheHeaders(response) {
    response.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
}

function createProjectsRouter({ projectsService, authService }) {
    const router = express.Router();

    router.get(
        "/",
        validate({ query: projectQuerySchema }),
        asyncHandler(async (req, res) => {
            const data = await projectsService.list(req.query);
            setPublicCacheHeaders(res);
            res.status(200).json(data);
        })
    );

    router.get(
        "/insights",
        validate({ query: projectInsightsQuerySchema }),
        asyncHandler(async (req, res) => {
            const data = await projectsService.getInsights(req.query);
            setPublicCacheHeaders(res);
            res.status(200).json(data);
        })
    );

    router.get(
        "/tags",
        validate({ query: projectTagsQuerySchema }),
        asyncHandler(async (req, res) => {
            const data = await projectsService.getTagsSummary(req.query);
            setPublicCacheHeaders(res);
            res.status(200).json(data);
        })
    );

    router.get(
        "/recommendations",
        validate({ query: projectRecommendationsQuerySchema }),
        asyncHandler(async (req, res) => {
            const data = await projectsService.getRecommendations(req.query);
            setPublicCacheHeaders(res);
            res.status(200).json(data);
        })
    );

    router.get(
        "/:id",
        validate({ params: idParamSchema }),
        asyncHandler(async (req, res) => {
            const project = await projectsService.getById(req.params.id);
            setPublicCacheHeaders(res);
            res.status(200).json(project);
        })
    );

    router.post(
        "/",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        validate({ body: projectCreateSchema }),
        asyncHandler(async (req, res) => {
            const project = await projectsService.create(req.body);
            res.status(201).json(project);
        })
    );

    router.patch(
        "/:id",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        validate({ params: idParamSchema, body: projectUpdateSchema }),
        asyncHandler(async (req, res) => {
            const project = await projectsService.update(req.params.id, req.body);
            res.status(200).json(project);
        })
    );

    router.delete(
        "/:id",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        validate({ params: idParamSchema }),
        asyncHandler(async (req, res) => {
            await projectsService.remove(req.params.id);
            res.status(204).send();
        })
    );

    return router;
}

module.exports = {
    createProjectsRouter
};
