const AppError = require('./app-error');

class BadRequestError extends AppError {
    constructor(invalidFields) {
        if (Array.isArray(invalidFields)) {
            super(`Invalid fields: ${invalidFields.join(', ')}`, 400);
        } else {
            super(`Invalid fields: ${invalidFields}`, 400);
        }

    }
}

module.exports = BadRequestError;