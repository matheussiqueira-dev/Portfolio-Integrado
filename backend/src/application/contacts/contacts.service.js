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

    async create(payload, options = {}) {
        if (payload.website) {
            throw new AppError("Payload invalido.", 400, "POTENTIAL_SPAM");
        }

        const fields = [payload.name, payload.email, payload.subject, payload.message];
        if (fields.some(value => includesSuspiciousSqlPattern(value))) {
            throw new AppError("Payload bloqueado por padrao suspeito.", 400, "SUSPICIOUS_PAYLOAD");
        }

        const idempotencyKey = this.#normalizeIdempotencyKey(options.idempotencyKey);
        if (idempotencyKey) {
            const existing = await this.contactsRepository.findByIdempotencyKey(idempotencyKey);
            if (existing) {
                return {
                    contact: existing,
                    deduplicated: true
                };
            }
        }

        const normalizedEmail = normalizeText(payload.email).toLowerCase();
        const normalizedMessage = normalizeText(payload.message);

        await this.#guardAgainstDuplicateRecentContact({
            email: normalizedEmail,
            message: normalizedMessage
        });

        const createdAt = nowIso();

        const contact = {
            id: createId("contact"),
            name: normalizeText(payload.name),
            email: normalizedEmail,
            subject: normalizeText(payload.subject),
            message: normalizedMessage,
            source: normalizeText(payload.source || "portfolio-site"),
            status: "new",
            idempotencyKey: idempotencyKey || null,
            statusHistory: [
                {
                    status: "new",
                    changedAt: createdAt,
                    actor: "system",
                    note: "Contato recebido"
                }
            ],
            createdAt,
            updatedAt: createdAt
        };

        await this.contactsRepository.create(contact);
        this.metricsStore.incrementContactsCreated();

        return {
            contact,
            deduplicated: false
        };
    }

    async list({ status = "all", page = 1, limit = 20, search = "", source = "", from, to }) {
        const pageNumber = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const normalizedSearch = normalizeText(search).toLowerCase();
        const normalizedSource = normalizeText(source).toLowerCase();
        const fromDate = this.#parseDateFilter(from, "from");
        const toDate = this.#parseDateFilter(to, "to");

        let contacts = await this.contactsRepository.list();

        if (status !== "all") {
            contacts = contacts.filter(contact => contact.status === status);
        }

        if (normalizedSource) {
            contacts = contacts.filter(contact => String(contact.source || "").toLowerCase() === normalizedSource);
        }

        if (normalizedSearch) {
            contacts = contacts.filter(contact => {
                const corpus = [
                    contact.name,
                    contact.email,
                    contact.subject,
                    contact.message,
                    contact.source
                ]
                    .map(value => String(value || "").toLowerCase())
                    .join(" ");

                return corpus.includes(normalizedSearch);
            });
        }

        if (fromDate || toDate) {
            contacts = contacts.filter(contact => {
                const created = Date.parse(contact.createdAt || "");
                if (!Number.isFinite(created)) {
                    return false;
                }

                if (fromDate && created < fromDate.getTime()) {
                    return false;
                }

                if (toDate && created > toDate.getTime()) {
                    return false;
                }

                return true;
            });
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

    async getById(id) {
        const contact = await this.contactsRepository.findById(id);
        if (!contact) {
            throw new AppError("Contato nao encontrado.", 404, "CONTACT_NOT_FOUND");
        }

        return contact;
    }

    async updateStatus(id, payload, context = {}) {
        const normalizedNote = normalizeText(payload.internalNote || "");
        const actor = normalizeText(context.actor || "admin");

        const updated = await this.contactsRepository.updateById(id, contact => ({
            ...contact,
            status: payload.status,
            internalNote: normalizedNote || contact.internalNote || "",
            statusHistory: [
                ...(Array.isArray(contact.statusHistory) ? contact.statusHistory : []),
                {
                    status: payload.status,
                    changedAt: nowIso(),
                    actor: actor || "admin",
                    note: normalizedNote || "Atualizacao de status"
                }
            ],
            updatedAt: nowIso()
        }));

        if (!updated) {
            throw new AppError("Contato nao encontrado.", 404, "CONTACT_NOT_FOUND");
        }

        return updated;
    }

    async #guardAgainstDuplicateRecentContact({ email, message }) {
        const contacts = await this.contactsRepository.list();
        const normalizedTargetMessage = String(message || "").toLowerCase();
        const duplicateWindowMs = 60 * 60 * 1000;

        const hasRecentDuplicate = contacts.some(contact => {
            if (String(contact.email || "").toLowerCase() !== String(email || "").toLowerCase()) {
                return false;
            }

            const previousMessage = normalizeText(contact.message).toLowerCase();
            if (previousMessage !== normalizedTargetMessage) {
                return false;
            }

            const elapsed = Date.now() - Date.parse(contact.createdAt || "");
            return Number.isFinite(elapsed) && elapsed >= 0 && elapsed <= duplicateWindowMs;
        });

        if (hasRecentDuplicate) {
            throw new AppError(
                "Mensagem duplicada detectada em curto intervalo.",
                409,
                "DUPLICATE_CONTACT",
                { duplicateWindowMinutes: 60 }
            );
        }
    }

    #normalizeIdempotencyKey(value) {
        const normalized = normalizeText(value);
        if (!normalized) {
            return "";
        }

        const valid = /^[a-zA-Z0-9._-]{8,120}$/.test(normalized);
        if (!valid) {
            throw new AppError(
                "Idempotency-Key invalido. Use de 8 a 120 caracteres alfanumericos.",
                400,
                "INVALID_IDEMPOTENCY_KEY"
            );
        }

        return normalized;
    }

    #parseDateFilter(value, fieldName) {
        if (!value) {
            return null;
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new AppError(
                `Filtro de data invalido para '${fieldName}'. Utilize formato ISO-8601.`,
                400,
                "INVALID_DATE_FILTER"
            );
        }

        return parsed;
    }
}

module.exports = {
    ContactsService
};
