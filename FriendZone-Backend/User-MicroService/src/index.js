const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDB = require('./configs/db-config');
const serverConfig = require('./configs/server-config');
const corsConfig = require('./configs/cors-config');
const routes = require('./routes');
const ImageQueueService = require('./services/queue/image-queue-service');
const GraphQueueService = require('./services/queue/graph-queue-service');
const http = require('http');
const UserSocketService = require('./services/socket/user-socket-service');

const app = express();

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
const server = http.createServer(app);
const userSocketService = new UserSocketService(server);
const imageQueueService = new ImageQueueService();
const graphQueueService = new GraphQueueService();
routes(app);

server.listen(serverConfig.PORT, async () => {
    try {
        await connectToDB();
        console.log(`Server running on http://localhost:${serverConfig.PORT}`);
        await userSocketService.socketConnection();
        await Promise.all([
            imageQueueService.processImageUploadJob(),
            graphQueueService.processGraphJob()
        ]);
    } catch (error) {
        console.log('Error starting server: ', error);
    }
});
