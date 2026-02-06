const express = require("express");
const { validate } = require("../middlewares/validate.middleware");
const { authenticationMiddleware, authorizeRoles } = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../middlewares/async-handler.middleware");
const {
    contactCreateSchema,
    contactListQuerySchema,
    contactStatusUpdateSchema,
    contactSummaryQuerySchema,
    idParamSchema
} = require("../schemas/schemas");

function createContactsRouter({ contactsService, authService, contactRateLimiter }) {
    const router = express.Router();

    router.post(
        "/",
        contactRateLimiter,
        validate({ body: contactCreateSchema }),
        asyncHandler(async (req, res) => {
            const { contact, deduplicated } = await contactsService.create(req.body, {
                idempotencyKey: req.headers["idempotency-key"]
            });

            res.status(deduplicated ? 200 : 201).json({
                id: contact.id,
                status: contact.status,
                createdAt: contact.createdAt,
                deduplicated,
                message: "Contato recebido com sucesso."
            });
        })
    );

    router.get(
        "/",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        validate({ query: contactListQuerySchema }),
        asyncHandler(async (req, res) => {
            const contacts = await contactsService.list(req.query);
            res.status(200).json(contacts);
        })
    );

    router.get(
        "/summary",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        validate({ query: contactSummaryQuerySchema }),
        asyncHandler(async (req, res) => {
            const summary = await contactsService.getSummary(req.query);
            res.status(200).json(summary);
        })
    );

    router.get(
        "/:id",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        validate({ params: idParamSchema }),
        asyncHandler(async (req, res) => {
            const contact = await contactsService.getById(req.params.id);
            res.status(200).json(contact);
        })
    );

    router.patch(
        "/:id/status",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        validate({ params: idParamSchema, body: contactStatusUpdateSchema }),
        asyncHandler(async (req, res) => {
            const updated = await contactsService.updateStatus(req.params.id, req.body, {
                actor: req.user.email
            });
            res.status(200).json(updated);
        })
    );

    return router;
}

module.exports = {
    createContactsRouter
};
