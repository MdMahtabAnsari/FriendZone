const AppError = require('./app-error');

class InternalServerError extends AppError {
    constructor() {
        super('Internal server error', 500);
    }
}

module.exports = InternalServerError;