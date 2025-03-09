const dotenv = require('dotenv');


dotenv.config();

module.exports = {
    //Port configuration
    PORT: process.env.PORT,
    //DB configuration
    DB_URL: process.env.DB_URL,
    //RabbitMQ configuration
    RABBITMQ_SERVICE_URL: process.env.RABBITMQ_SERVICE_URL,

    //API configuration
    API_GATEWAY_URL: process.env.API_GATEWAY_URL,
    //JWT configuration
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,

    //Redis configuration
    REDIS_SERVICE_URL: process.env.REDIS_SERVICE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN=== '*' ? '*' : process.env.CORS_ORIGIN?.split(','),
    CORS_METHODS: process.env.CORS_METHODS?.split(','),
    CORS_HEADERS: process.env.CORS_HEADERS?.split(','),
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',

}