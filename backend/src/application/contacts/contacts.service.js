const { AppError } = require("../../common/errors");
const {
    createId,
    normalizeText,
    nowIso,
    includesSuspiciousSqlPattern
} = require("../../common/utils");

class ContactsService {
    constructor({ contactsRepository, metricsStore }) {
        this.contactsRepository = contactsRepository;
        this.metricsStore = metricsStore;
    }

    async create(payload) {
        if (payload.website) {
            throw new AppError("Payload invalido.", 400, "POTENTIAL_SPAM");
        }

        const fields = [payload.name, payload.email, payload.subject, payload.message];
        if (fields.some(value => includesSuspiciousSqlPattern(value))) {
            throw new AppError("Payload bloqueado por padrao suspeito.", 400, "SUSPICIOUS_PAYLOAD");
        }

        const createdAt = nowIso();

        const contact = {
            id: createId("contact"),
            name: normalizeText(payload.name),
            email: normalizeText(payload.email).toLowerCase(),
            subject: normalizeText(payload.subject),
            message: normalizeText(payload.message),
            source: normalizeText(payload.source || "portfolio-site"),
            status: "new",
            createdAt,
            updatedAt: createdAt
        };

        await this.contactsRepository.create(contact);
        this.metricsStore.incrementContactsCreated();

        return contact;
    }

    async list({ status = "all", page = 1, limit = 20 }) {
        const pageNumber = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

        let contacts = await this.contactsRepository.list();

        if (status !== "all") {
            contacts = contacts.filter(contact => contact.status === status);
        }

        contacts = [...contacts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        const total = contacts.length;
        const offset = (pageNumber - 1) * perPage;

        return {
            items: contacts.slice(offset, offset + perPage),
            pagination: {
                page: pageNumber,
                limit: perPage,
                total,
                totalPages: Math.max(Math.ceil(total / perPage), 1)
            }
        };
    }

    async updateStatus(id, status) {
        const updated = await this.contactsRepository.updateById(id, contact => ({
            ...contact,
            status,
            updatedAt: nowIso()
        }));

        if (!updated) {
            throw new AppError("Contato nao encontrado.", 404, "CONTACT_NOT_FOUND");
        }

        return updated;
    }
}

module.exports = {
    ContactsService
};
