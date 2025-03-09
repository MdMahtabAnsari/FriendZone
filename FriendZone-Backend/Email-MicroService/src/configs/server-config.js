const dotenv = require('dotenv');

dotenv.config();
module.exports = {
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    //SMTP Configuration
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
    // RabbitMQ Configuration
    RABBITMQ_SERVICE_URL: process.env.RABBITMQ_SERVICE_URL,
}
