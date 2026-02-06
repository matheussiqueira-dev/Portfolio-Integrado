const express = require("express");
const { validate } = require("../middlewares/validate.middleware");
const { authenticationMiddleware, authorizeRoles } = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../middlewares/async-handler.middleware");
const {
    contactCreateSchema,
    contactListQuerySchema,
    contactStatusUpdateSchema,
    idParamSchema
} = require("../schemas/schemas");

function createContactsRouter({ contactsService, authService, contactRateLimiter }) {
    const router = express.Router();

    router.post(
        "/",
        contactRateLimiter,
        validate({ body: contactCreateSchema }),
        asyncHandler(async (req, res) => {
            const contact = await contactsService.create(req.body);
            res.status(201).json({
                id: contact.id,
                status: contact.status,
                createdAt: contact.createdAt,
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

    router.patch(
        "/:id/status",
        authenticationMiddleware(authService),
        authorizeRoles("admin"),
        validate({ params: idParamSchema, body: contactStatusUpdateSchema }),
        asyncHandler(async (req, res) => {
            const updated = await contactsService.updateStatus(req.params.id, req.body.status);
            res.status(200).json(updated);
        })
    );

    return router;
}

module.exports = {
    createContactsRouter
};
