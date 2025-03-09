const express = require('express');
const {PORT} = require('./configs/server-config');
const Consumer = require('./services/rabbitmq/consumer');
const NfswQueueService = require('./services/queue/nfsw-queue-service');
const {connectToDB} = require('./configs/db-config');


const app = express();
const consumer = new Consumer();
const nfswQueueService = new NfswQueueService();
app.listen(PORT, async () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    await connectToDB();
    await consumer.consumeFromQueue('nsfw-process-input');

    await nfswQueueService.processNFSWJob();
});