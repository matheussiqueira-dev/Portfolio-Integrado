const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppError } = require("../../common/errors");
const { createId, nowIso } = require("../../common/utils");

class AuthService {
    constructor({ usersRepository, config, loginAttemptStore }) {
        this.usersRepository = usersRepository;
        this.config = config;
        this.loginAttemptStore = loginAttemptStore;
    }

    async ensureAdminUser() {
        const email = this.config.adminEmail.toLowerCase();
        const now = nowIso();

        await this.usersRepository.upsertByEmail(email, async current => {
            if (current) {
                const currentRole = current.role || "admin";
                const passwordMatches = await safeComparePassword(this.config.adminPassword, current.passwordHash);
                const shouldRotatePassword = !passwordMatches;
                const shouldAdjustRole = currentRole !== "admin";
                const shouldAdjustEmail = String(current.email || "").toLowerCase() !== email;

                if (!shouldRotatePassword && !shouldAdjustRole && !shouldAdjustEmail) {
                    return current;
                }

                return {
                    ...current,
                    email,
                    passwordHash: shouldRotatePassword
                        ? await bcrypt.hash(this.config.adminPassword, 10)
                        : current.passwordHash,
                    role: "admin",
                    updatedAt: now
                };
            }

            return {
                id: createId("user"),
                email,
                passwordHash: await bcrypt.hash(this.config.adminPassword, 10),
                role: "admin",
                createdAt: now,
                updatedAt: now
            };
        });
    }

    async login(email, password, requestContext = {}) {
        const normalizedEmail = String(email || "").toLowerCase().trim();
        const identity = this.#buildLoginIdentity(normalizedEmail, requestContext.ip);
        const activeLock = this.loginAttemptStore.getLock(identity);

        if (activeLock.isLocked) {
            throw new AppError(
                "Muitas tentativas de login. Aguarde para tentar novamente.",
                429,
                "AUTH_LOCKED",
                { retryAfterSeconds: activeLock.retryAfterSeconds }
            );
        }

        const user = await this.usersRepository.findByEmail(normalizedEmail);

        if (!user) {
            this.#registerInvalidAttempt(identity);
            throw new AppError("Credenciais invalidas.", 401, "INVALID_CREDENTIALS");
        }

        const isValid = await bcrypt.compare(String(password || ""), user.passwordHash);
        if (!isValid) {
            this.#registerInvalidAttempt(identity);
            throw new AppError("Credenciais invalidas.", 401, "INVALID_CREDENTIALS");
        }

        this.loginAttemptStore.clear(identity);

        const token = jwt.sign(
            {
                sub: user.id,
                role: user.role,
                email: user.email
            },
            this.config.jwtSecret,
            {
                expiresIn: this.config.jwtExpiresIn,
                issuer: this.config.jwtIssuer,
                jwtid: createId("session")
            }
        );

        return {
            accessToken: token,
            tokenType: "Bearer",
            expiresIn: this.config.jwtExpiresIn,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.config.jwtSecret, {
                issuer: this.config.jwtIssuer
            });
        } catch (_error) {
            throw new AppError("Token invalido ou expirado.", 401, "INVALID_TOKEN");
        }
    }

    async getProfile(userId) {
        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new AppError("Usuario nao encontrado.", 404, "USER_NOT_FOUND");
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role
        };
    }

    #registerInvalidAttempt(identity) {
        const failedAttempt = this.loginAttemptStore.registerFailure(identity);

        if (failedAttempt.isLocked) {
            throw new AppError(
                "Muitas tentativas de login. Aguarde para tentar novamente.",
                429,
                "AUTH_LOCKED",
                { retryAfterSeconds: failedAttempt.retryAfterSeconds }
            );
        }
    }

    #buildLoginIdentity(email, ipAddress) {
        return `${String(email || "").toLowerCase()}|${String(ipAddress || "unknown").trim()}`;
    }
}

async function safeComparePassword(rawPassword, hashedPassword) {
    try {
        if (!hashedPassword) {
            return false;
        }
        return await bcrypt.compare(rawPassword, hashedPassword);
    } catch (_error) {
        return false;
    }
}

module.exports = {
    AuthService
};
