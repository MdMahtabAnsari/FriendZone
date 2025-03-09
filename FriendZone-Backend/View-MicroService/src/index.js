const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index');
const {PORT} = require('./configs/server-config');
const {connectToDB} = require('./configs/db-config');
const ViewSocketService = require('./services/socket/view-socket-service');
const Consumer = require('./services/rabbitmq/consumer');
const cors = require('cors');
const corsConfig = require('./configs/cors-config');

const app = express();
app.use(cors(corsConfig));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
const server = http.createServer(app);
const viewSocketService = new ViewSocketService(server);
const consumer = new Consumer();
routes(app);

server.listen(PORT, async () => {
    console.log(`View Service is running on port ${PORT}`);
    console.log(corsConfig);
    await connectToDB();
    await consumer.consumeFromQueue('view');
    await viewSocketService.socketConnection();
});

