const express = require('express');
const cors = require('cors');
const {PORT} = require('./configs/server-config');
const corsConfig = require('./configs/cors-config');
const ImageQueueService = require('./services/queue/image-queue-service');
const {connectToDB} = require('./configs/db-config');
const router = require('./routes/index');
const PostSocketService = require('./services/socket/post-socket-service');
const cookieParser = require('cookie-parser');
const http = require('http');
const Consumer = require('./services/rabbitmq/consumer');


const app = express();
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
const server = http.createServer(app);
const postSocketService = new PostSocketService(server);
const imageQueueService = new ImageQueueService();
const consumer = new Consumer();


router(app);

server.listen(PORT, async () => {

    await connectToDB();
    await postSocketService.socketConnection();
    console.log(`Server is running on port http://localhost:${PORT}`);
    await consumer.consumeFromQueue('graph-post-queue');
    await consumer.consumeFromImageProcessedQueue('image-process-output');
    await consumer.consumeFromNfSWQueue('nfsw-process-output');
    await imageQueueService.processImageUploadJob();
});

