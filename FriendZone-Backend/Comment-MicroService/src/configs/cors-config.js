const serverConfig = require('./server-config');

const corsConfig = {
    origin: serverConfig.CORS_ORIGIN,
    methods: serverConfig.CORS_METHODS,
    allowedHeaders: serverConfig.CORS_HEADERS,
    credentials: serverConfig.CORS_CREDENTIALS
};

module.exports = corsConfig;
