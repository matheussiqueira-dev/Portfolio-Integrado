class ContactsRepository {
    constructor(database) {
        this.database = database;
    }

    async list() {
        const data = await this.database.read();
        return data.contacts;
    }

    async create(contact) {
        await this.database.update(data => {
            data.contacts.push(contact);
            return data;
        });
        return contact;
    }

    async updateById(id, updater) {
        let updated = null;

        await this.database.update(data => {
            data.contacts = data.contacts.map(contact => {
                if (contact.id !== id) {
                    return contact;
                }
                updated = updater(contact);
                return updated;
            });
            return data;
        });

        return updated;
    }

    async findById(id) {
        const contacts = await this.list();
        return contacts.find(contact => contact.id === id) || null;
    }
}

module.exports = {
    ContactsRepository
};
