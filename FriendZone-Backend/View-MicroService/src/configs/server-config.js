const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    //Port Configuration
    PORT: process.env.PORT,
    //DB Configuration
    DB_URL: process.env.DB_URL,
    //Neo4j Configuration
    NEO4J_URL: process.env.NEO4J_URL,
    NEO4J_USER: process.env.NEO4J_USER,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,

    //RabbitMQ Configuration
    RABBITMQ_SERVICE_URL: process.env.RABBITMQ_SERVICE_URL,
    // API Configuration
    API_GATEWAY_URL: process.env.API_GATEWAY_URL,

    // Redis Configuration
    REDIS_SERVICE_URL: process.env.REDIS_SERVICE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    // JWT Configuration
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,

    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN=== '*' ? '*' : process.env.CORS_ORIGIN?.split(','),
    CORS_METHODS: process.env.CORS_METHODS?.split(','),
    CORS_HEADERS: process.env.CORS_HEADERS?.split(','),
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',


}