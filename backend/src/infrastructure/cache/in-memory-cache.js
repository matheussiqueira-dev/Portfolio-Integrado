class InMemoryCache {
    constructor({ maxEntries = 500 } = {}) {
        this.store = new Map();
        this.maxEntries = Math.max(Number(maxEntries) || 500, 50);
    }

    get(key) {
        const record = this.store.get(key);
        if (!record) {
            return null;
        }

        if (record.expiresAt < Date.now()) {
            this.store.delete(key);
            return null;
        }

        return cloneSafe(record.value);
    }

    set(key, value, ttlMs = 5000) {
        this.#cleanupExpired();
        this.#evictIfNeeded();

        this.store.set(key, {
            value: cloneSafe(value),
            expiresAt: Date.now() + ttlMs
        });
    }

    delByPrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }

    #cleanupExpired() {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
            if (record.expiresAt <= now) {
                this.store.delete(key);
            }
        }
    }

    #evictIfNeeded() {
        while (this.store.size >= this.maxEntries) {
            const oldest = this.store.keys().next().value;
            if (!oldest) {
                break;
            }
            this.store.delete(oldest);
        }
    }
}

function cloneSafe(value) {
    if (value === null || value === undefined) {
        return value;
    }

    return structuredClone(value);
}

module.exports = {
    InMemoryCache
};
