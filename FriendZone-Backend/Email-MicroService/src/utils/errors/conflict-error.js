const AppError = require('./app-error');

class ConflictError extends AppError {
    constructor(resource) {
        super(`${resource} already exists`, 409);
    }
}

module.exports = ConflictError;