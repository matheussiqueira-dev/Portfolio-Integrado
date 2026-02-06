const { AppError } = require("../../../common/errors");

function validate({ body, query, params }) {
    return (req, _res, next) => {
        try {
            if (body) {
                req.body = body.parse(req.body);
            }

            if (query) {
                req.query = query.parse(req.query);
            }

            if (params) {
                req.params = params.parse(req.params);
            }

            next();
        } catch (error) {
            next(new AppError("Dados invalidos na requisicao.", 400, "VALIDATION_ERROR", error.errors || error.message));
        }
    };
}

module.exports = {
    validate
};
