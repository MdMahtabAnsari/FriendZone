const express = require('express');
const {PORT} = require('./configs/server-config');
const Consumer = require('./services/rabbitmq/consumer');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const consumer = new Consumer();

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await consumer.consumeFromQueue('email');
});