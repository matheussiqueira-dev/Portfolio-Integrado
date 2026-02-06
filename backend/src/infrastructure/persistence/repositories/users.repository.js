class UsersRepository {
    constructor(database) {
        this.database = database;
    }

    async list() {
        const data = await this.database.read();
        return data.users;
    }

    async findByEmail(email) {
        const users = await this.list();
        return users.find(user => user.email.toLowerCase() === String(email || "").toLowerCase()) || null;
    }

    async findById(id) {
        const users = await this.list();
        return users.find(user => user.id === id) || null;
    }

    async upsertByEmail(email, createOrUpdateFn) {
        let persisted = null;

        await this.database.update(data => {
            const index = data.users.findIndex(user => user.email.toLowerCase() === String(email).toLowerCase());

            if (index >= 0) {
                const next = createOrUpdateFn(data.users[index]);
                data.users[index] = next;
                persisted = next;
            } else {
                const created = createOrUpdateFn(null);
                data.users.push(created);
                persisted = created;
            }

            return data;
        });

        return persisted;
    }
}

module.exports = {
    UsersRepository
};
