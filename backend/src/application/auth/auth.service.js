const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppError } = require("../../common/errors");
const { createId, nowIso } = require("../../common/utils");

class AuthService {
    constructor({ usersRepository, config }) {
        this.usersRepository = usersRepository;
        this.config = config;
    }

    async ensureAdminUser() {
        const email = this.config.adminEmail.toLowerCase();
        const passwordHash = await bcrypt.hash(this.config.adminPassword, 10);

        await this.usersRepository.upsertByEmail(email, current => {
            if (current) {
                return {
                    ...current,
                    email,
                    passwordHash,
                    role: "admin",
                    updatedAt: nowIso()
                };
            }

            const timestamp = nowIso();
            return {
                id: createId("user"),
                email,
                passwordHash,
                role: "admin",
                createdAt: timestamp,
                updatedAt: timestamp
            };
        });
    }

    async login(email, password) {
        const normalizedEmail = String(email || "").toLowerCase().trim();
        const user = await this.usersRepository.findByEmail(normalizedEmail);

        if (!user) {
            throw new AppError("Credenciais invalidas.", 401, "INVALID_CREDENTIALS");
        }

        const isValid = await bcrypt.compare(String(password || ""), user.passwordHash);
        if (!isValid) {
            throw new AppError("Credenciais invalidas.", 401, "INVALID_CREDENTIALS");
        }

        const token = jwt.sign(
            {
                sub: user.id,
                role: user.role,
                email: user.email
            },
            this.config.jwtSecret,
            { expiresIn: this.config.jwtExpiresIn }
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
            return jwt.verify(token, this.config.jwtSecret);
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
}

module.exports = {
    AuthService
};
