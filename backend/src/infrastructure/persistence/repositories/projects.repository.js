class ProjectsRepository {
    constructor(database) {
        this.database = database;
    }

    async list() {
        const data = await this.database.read();
        return data.projects;
    }

    async findById(id) {
        const projects = await this.list();
        return projects.find(project => project.id === id) || null;
    }

    async create(project) {
        await this.database.update(data => {
            data.projects.push(project);
            return data;
        });
        return project;
    }

    async updateById(id, updater) {
        let updated = null;

        await this.database.update(data => {
            data.projects = data.projects.map(project => {
                if (project.id !== id) {
                    return project;
                }
                updated = updater(project);
                return updated;
            });

            return data;
        });

        return updated;
    }

    async removeById(id) {
        let removed = null;

        await this.database.update(data => {
            const remaining = [];

            for (const project of data.projects) {
                if (project.id === id) {
                    removed = project;
                } else {
                    remaining.push(project);
                }
            }

            data.projects = remaining;
            return data;
        });

        return removed;
    }
}

module.exports = {
    ProjectsRepository
};
