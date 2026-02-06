const { randomUUID } = require("node:crypto");

function normalizeText(value) {
    return String(value || "")
        .replace(/<[^>]*>/g, "")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .trim();
}

function normalizeList(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map(item => normalizeText(item))
        .filter(Boolean);
}

function createId(prefix = "id") {
    return `${prefix}-${randomUUID()}`;
}

function nowIso() {
    return new Date().toISOString();
}

function includesSuspiciousSqlPattern(text) {
    const normalized = String(text || "").toLowerCase();
    return /(union\s+select|drop\s+table|--|;\s*shutdown|or\s+1=1)/i.test(normalized);
}

module.exports = {
    normalizeText,
    normalizeList,
    createId,
    nowIso,
    includesSuspiciousSqlPattern
};
