const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const NotificationSocketService = require('./services/socket/notification-socket-service');
const Consumer = require('./services/rabbitmq/consumer');
const {PORT} = require('./configs/server-config');
const {connectToDB} = require('./configs/db-config');
const routes = require('./routes/index');
const cors = require('cors');
const corsConfig = require('./configs/cors-config');

const app = express();

app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const server = http.createServer(app);
const notificationSocketService = new NotificationSocketService(server);

const consumer = new Consumer();
routes(app);

server.listen(PORT, async () => {
    await connectToDB();
    await notificationSocketService.socketConnection();
    await consumer.consumeFromQueue('notification');
    console.log(`Notification microservice running on port ${PORT}`);
});