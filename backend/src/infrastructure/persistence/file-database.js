const fs = require("node:fs/promises");
const path = require("node:path");

class FileDatabase {
    constructor(filePath, defaults) {
        this.filePath = filePath;
        this.defaults = defaults;
        this.writeQueue = Promise.resolve();
    }

    async ensure() {
        const directory = path.dirname(this.filePath);
        await fs.mkdir(directory, { recursive: true });

        try {
            await fs.access(this.filePath);
        } catch (_error) {
            await this.#write(this.defaults);
        }
    }

    async read() {
        const raw = await fs.readFile(this.filePath, "utf8");
        const data = JSON.parse(raw || "{}");
        return {
            projects: Array.isArray(data.projects) ? data.projects : [],
            contacts: Array.isArray(data.contacts) ? data.contacts : [],
            users: Array.isArray(data.users) ? data.users : []
        };
    }

    async update(mutator) {
        this.writeQueue = this.writeQueue.then(async () => {
            const current = await this.read();
            const next = await mutator(structuredClone(current));
            await this.#write(next);
            return next;
        });

        return this.writeQueue;
    }

    async #write(payload) {
        const temp = `${this.filePath}.tmp`;
        await fs.writeFile(temp, JSON.stringify(payload, null, 2), "utf8");
        await fs.rename(temp, this.filePath);
    }
}

module.exports = {
    FileDatabase
};
