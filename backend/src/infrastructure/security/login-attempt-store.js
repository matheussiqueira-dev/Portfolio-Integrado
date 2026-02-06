function createLoginAttemptStore({ maxAttempts = 5, lockWindowMs = 10 * 60 * 1000 } = {}) {
    const attempts = new Map();

    return {
        getLock(identity) {
            const key = normalizeIdentity(identity);
            if (!key) {
                return { isLocked: false, retryAfterSeconds: 0 };
            }

            cleanupExpiredRecord(attempts, key);
            const current = attempts.get(key);

            if (!current || !current.lockedUntil || current.lockedUntil <= Date.now()) {
                return { isLocked: false, retryAfterSeconds: 0 };
            }

            return {
                isLocked: true,
                retryAfterSeconds: Math.max(Math.ceil((current.lockedUntil - Date.now()) / 1000), 1)
            };
        },
        registerFailure(identity) {
            const key = normalizeIdentity(identity);
            if (!key) {
                return { isLocked: false, retryAfterSeconds: 0, remainingAttempts: maxAttempts };
            }

            cleanupExpiredRecord(attempts, key);

            const current = attempts.get(key) || {
                failures: 0,
                lockedUntil: 0
            };

            current.failures += 1;

            if (current.failures >= maxAttempts) {
                current.failures = 0;
                current.lockedUntil = Date.now() + lockWindowMs;
            }

            attempts.set(key, current);

            if (current.lockedUntil > Date.now()) {
                return {
                    isLocked: true,
                    retryAfterSeconds: Math.max(Math.ceil((current.lockedUntil - Date.now()) / 1000), 1),
                    remainingAttempts: 0
                };
            }

            return {
                isLocked: false,
                retryAfterSeconds: 0,
                remainingAttempts: Math.max(maxAttempts - current.failures, 0)
            };
        },
        clear(identity) {
            const key = normalizeIdentity(identity);
            if (!key) {
                return;
            }
            attempts.delete(key);
        }
    };
}

function normalizeIdentity(identity) {
    return String(identity || "").trim().toLowerCase();
}

function cleanupExpiredRecord(store, key) {
    const current = store.get(key);
    if (!current) {
        return;
    }

    if (!current.lockedUntil) {
        return;
    }

    if (current.lockedUntil <= Date.now()) {
        store.delete(key);
    }
}

module.exports = {
    createLoginAttemptStore
};
