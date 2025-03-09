const express = require('express');
const app = express();
const Consumer = require('./services/rabbitmq/consumer');
const SentimentQueueService = require('./services/queue/sentiment-queue-service');
const consumer = new Consumer();
const sentimentQueueService = new SentimentQueueService();



app.listen(3000, async() => {
    console.log('Sentiment Service running on port 3000');
    await consumer.consumeFromQueue('sentiment');
    await sentimentQueueService.processSentimentJob();
});