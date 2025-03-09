const express = require('express');
const http = require('http');
const {connectToDB} = require('./configs/db-config');
const {PORT} = require('./configs/server-config');
const Consumer = require('./services/rabbitmq/consumer');
const routes = require('./routes/index');
const CommentSocketService = require('./services/socket/comment-socket-service');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsConfig = require('./configs/cors-config');

const app = express();

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
const server = http.createServer(app);
const commentSocketService = new CommentSocketService(server);
const consumer = new Consumer();

routes(app);

server.listen(PORT, async () => {
    await connectToDB();
    console.log('Server started on port: ', PORT);
    await commentSocketService.socketConnection();
    await consumer.consumeFromQueue('comment');
    await consumer.consumeFromToxicQueue('toxic');
});