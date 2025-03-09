const {Server} = require('socket.io');
const {socketValidator} = require('../../validators/socket-validator');
const SocketUserRedisRepository = require('../../repositories/redis/socket-user-redis-repository');
const {createAdapter} = require("@socket.io/redis-adapter");
const {createClient} = require('ioredis');
const {REDIS_SERVICE_URL} = require('../../configs/server-config');
const corsConfig = require('../../configs/cors-config');


class NotificationSocketService {
    static #io = null;
    static #server = null;
    static #pubClient = null;
    static #subClient = null;

    constructor(server) {
        try {
            if (NotificationSocketService.#io) {
                return NotificationSocketService.#io;
            }

            if (server) {
                NotificationSocketService.#server = server;
            } else if (!NotificationSocketService.#server) {
                throw new Error('Server instance is required for the first initialization');
            }

            this.io = new Server(NotificationSocketService.#server, {
                path: '/api/notifications/socket/socket.io/',
                pingInterval: 10000,//ping every 10 seconds
                pingTimeout: 5000,//disconnect if pong is not received in 5 seconds
                cors: corsConfig, // Allow only the client URL to connect
            });
            if (!NotificationSocketService.#pubClient) {
                NotificationSocketService.#pubClient = createClient(REDIS_SERVICE_URL);
            }
            if (!NotificationSocketService.#subClient) {
                NotificationSocketService.#subClient = NotificationSocketService.#pubClient.duplicate();
            }

            this.io.adapter(createAdapter(NotificationSocketService.#pubClient, NotificationSocketService.#subClient));
            NotificationSocketService.#io = this;
            console.log('Socket Server Created');
            this.socketUserRedisRepository = new SocketUserRedisRepository();
        } catch (error) {
            console.log(error);
        }


    }

    #getNotificationNamespace() {
        return this.io.of('/api/notifications/socket');
    }

    async socketConnection() {
        try {
            console.log('Socket connection established');
            const notificationNamespace = this.#getNotificationNamespace();
            notificationNamespace.use(socketValidator);
            notificationNamespace.on('connection', async (socket) => {
                console.log('Socket connected');
                const {userId, id} = socket;
                await this.socketUserRedisRepository.saveUserSocketId({userId, socketId: id});
                console.log('Socket connected');
                socket.on('disconnect', async () => {
                    await this.socketUserRedisRepository.deleteUserBySocketId(id);
                    console.log('Socket disconnected');
                });

            });
            setInterval(() => {
                try {
                    console.log('Resetting socket expiry');
                    notificationNamespace.sockets.sockets.forEach(async (socket) => {
                        const {userId, id} = socket;
                        await this.socketUserRedisRepository.resetExpiry(userId);
                        console.log(`Reset expiry for user ${userId}:${id}`);
                    });
                } catch (error) {
                    console.log(error);
                }
            }, 1800000); // Reset expiry every 30 minutes
        } catch (error) {
            console.log(error);
            console.log('Socket connection failed');
        }
    }

    async emitNotification({userId, event, data}) {
        try {
            const socketId = await this.socketUserRedisRepository.getUserSocketId(userId);
            const notificationNamespace = this.#getNotificationNamespace();
            if (socketId) {
                notificationNamespace.to(socketId).emit(event, data);
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }

    }

    async disconnect() {
        try {
            if (NotificationSocketService.#io) {
                await this.io?.close();
                NotificationSocketService.#io = null;
            }
            if (NotificationSocketService.#server) {
                NotificationSocketService.#server?.close(); // Close the HTTP server
                NotificationSocketService.#server = null;
            }
            if (NotificationSocketService.#pubClient) {
                await NotificationSocketService.#pubClient.quit();
                NotificationSocketService.#pubClient = null;
            }
            if (NotificationSocketService.#subClient) {
                await NotificationSocketService.#subClient.quit();
                NotificationSocketService.#subClient = null;
            }

        } catch (error) {
            console.log(error);
        }
    }


}

const gracefullyShutdown = async () => {
    try {
        const notificationSocketService = new NotificationSocketService();
        await notificationSocketService.disconnect();
        console.log('Gracefully shutting down socket server');
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

process.on('SIGINT', gracefullyShutdown);

process.on('SIGTERM', gracefullyShutdown);

process.on('exit', gracefullyShutdown);

module.exports = NotificationSocketService;