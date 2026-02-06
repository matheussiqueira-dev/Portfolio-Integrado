class InMemoryCache {
    constructor() {
        this.store = new Map();
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

        return record.value;
    }

    set(key, value, ttlMs = 5000) {
        this.store.set(key, {
            value,
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
}

module.exports = {
    InMemoryCache
};
