const dotenv = require('dotenv');
dotenv.config();


module.exports = {
//     Port Configurations
    PORT: process.env.PORT || 3000,
//     DB Configurations
    DB_URL: process.env.DB_URL,
//     RabbitMQ Configurations
    RABBITMQ_SERVICE_URL: process.env.RABBITMQ_SERVICE_URL,
//Redis configuration
    REDIS_SERVICE_URL: process.env.REDIS_SERVICE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_SECURE: process.env.REDIS_SECURE === 'true',
//     Frame Rate Configurations
    FRAME_RATE: parseInt(process.env.FRAME_RATE) || 1,
}