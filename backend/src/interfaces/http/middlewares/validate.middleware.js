const { AppError } = require("../../../common/errors");

function validate({ body, query, params }) {
    return (req, _res, next) => {
        try {
            if (body) {
                const result = body.safeParse(req.body);
                if (!result.success) {
                    throw new AppError(
                        "Dados invalidos na requisicao.",
                        400,
                        "VALIDATION_ERROR",
                        mapValidationIssues(result.error.issues)
                    );
                }
                req.body = result.data;
            }

            if (query) {
                const result = query.safeParse(req.query);
                if (!result.success) {
                    throw new AppError(
                        "Dados invalidos na requisicao.",
                        400,
                        "VALIDATION_ERROR",
                        mapValidationIssues(result.error.issues)
                    );
                }
                req.query = result.data;
            }

            if (params) {
                const result = params.safeParse(req.params);
                if (!result.success) {
                    throw new AppError(
                        "Dados invalidos na requisicao.",
                        400,
                        "VALIDATION_ERROR",
                        mapValidationIssues(result.error.issues)
                    );
                }
                req.params = result.data;
            }

            next();
        } catch (error) {
            if (error instanceof AppError) {
                return next(error);
            }

            next(new AppError("Dados invalidos na requisicao.", 400, "VALIDATION_ERROR", error.message));
        }
    };
}

function mapValidationIssues(issues = []) {
    return issues.map(issue => ({
        path: issue.path?.join(".") || "",
        message: issue.message
    }));
}

module.exports = {
    validate
};
