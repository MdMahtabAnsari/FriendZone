const AppError = require('./app-error');

class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, 404);
    }
}

module.exports = NotFoundError;