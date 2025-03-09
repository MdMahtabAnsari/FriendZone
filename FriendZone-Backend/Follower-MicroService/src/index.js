const express = require('express');
const cookieParser = require('cookie-parser');
const {PORT} = require('./configs/server-config');
const routes = require('./routes/index');
const http = require('http');
const FollowerSocketService = require('./services/socket/follower-socket-service');
const {connectToDB} = require('./configs/db-config');
const Consumer = require('./services/rabbitmq/consumer');
const cors = require('cors');
const corsConfig = require('./configs/cors-config');

const app = express();

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
const server = http.createServer(app);
const followerSocketService = new FollowerSocketService(server);
const consumer = new Consumer();
routes(app);
server.listen(PORT, async () => {
    await connectToDB();
    console.log(`Server is running on port http://localhost:${PORT}`);
    await followerSocketService.socketConnection();
    await consumer.consumeFromQueue('follower');
});
