const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    // RabbitMQ service URL
    RABBITMQ_SERVICE_URL: process.env.RABBITMQ_SERVICE_URL,
//     Sentiment Threshold
    SENTIMENT_THRESHOLD: parseFloat(process.env.SENTIMENT_THRESHOLD) || 0.9,
//     Toxicity Labels
    TOXICITY_LABELS: process.env.TOXICITY_LABELS.split(',')||['toxicity', 'severe_toxicity', 'identity_attack', 'insult', 'threat', 'profanity', 'sexual_explicit'],
    //Redis configuration
    REDIS_SERVICE_URL: process.env.REDIS_SERVICE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_SECURE: process.env.REDIS_SECURE === 'true',
}