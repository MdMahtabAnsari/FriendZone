class DisconnectError extends Error {
    constructor() {
        super('Error while disconnecting from kafka');
        this.name = 'DisconnectError';
    }
}

module.exports = DisconnectError;