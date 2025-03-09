const AppError = require('./app-error');

class UnauthorizedError extends AppError {
    constructor(message) {
        if (!message) {
            super('Unauthorized', 401);
        } else {
            super(message, 401);
        }

    }
}

module.exports = UnauthorizedError;