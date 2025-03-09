class ConnectError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConnectError';
    }
}


module.exports = ConnectError;