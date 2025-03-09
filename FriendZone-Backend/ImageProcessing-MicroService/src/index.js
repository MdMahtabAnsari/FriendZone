const express = require('express');
const {PORT} = require('./configs/server-config');
const Consumer = require('./services/rabbitmq/consumer');
const ImageQueueService = require('./services/queue/image-queue-service');
const {connectToDB} = require('./configs/db-config');


const app = express();
const consumer = new Consumer();
const imageQueueService = new ImageQueueService();
app.listen(PORT, async () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    await connectToDB();
    await consumer.consumeFromQueue('image-process-input');

    await imageQueueService.processImageJob();
});