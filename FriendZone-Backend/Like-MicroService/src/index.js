const express = require('express');
const cookieParser = require('cookie-parser');
const {connectToDB} = require('./configs/db-config');
const {PORT} = require('./configs/server-config');
const Consumer = require('./services/rabbitmq/consumer');
const routes = require('./routes/index');
const cors = require('cors');
const corsConfig = require('./configs/cors-config');
const http = require('http');
const LikeSocketService = require('./services/socket/like-socket-service');

const app = express();

const server = http.createServer(app);
app.use(cors(corsConfig))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const likeSocketService = new LikeSocketService(server);
const consumer = new Consumer();
routes(app);

server.listen(PORT, async () => {
    await connectToDB();
    console.log(`Like Microservice is running on port ${PORT}`);
    await consumer.consumeFromQueue('comment-like');
    await consumer.consumeFromQueue('post-like');
    await likeSocketService.socketConnection()
});
