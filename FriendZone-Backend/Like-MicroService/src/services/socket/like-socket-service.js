const {Server} = require('socket.io');
const {socketValidator} = require('../../validators/socket-validator');
const SocketUserRedisRepository = require('../../repositories/redis/socket-user-redis-repository');
const {createAdapter} = require("@socket.io/redis-adapter");
const {createClient} = require('ioredis');
const {REDIS_SERVICE_URL} = require('../../configs/server-config');
const corsConfig = require('../../configs/cors-config');


class LikeSocketService {
    static #io = null;
    static #server = null;
    static #pubClient = null;
    static #subClient = null;

    constructor(server) {
        try {
            if (LikeSocketService.#io) {
                return LikeSocketService.#io;
            }

            if (server) {
                LikeSocketService.#server = server;
            } else if (!LikeSocketService.#server) {
                throw new Error('Server instance is required for the first initialization');
            }

            this.io = new Server(LikeSocketService.#server, {
                path: '/api/likes/socket/socket.io/',
                pingInterval: 10000,//ping every 10 seconds
                pingTimeout: 5000,//disconnect if pong is not received in 5 seconds
                cors: corsConfig, // Allow only the client URL to connect
            });
            if (!LikeSocketService.#pubClient) {
                LikeSocketService.#pubClient = createClient(REDIS_SERVICE_URL);
            }
            if (!LikeSocketService.#subClient) {
                LikeSocketService.#subClient = LikeSocketService.#pubClient.duplicate();
            }

            this.io.adapter(createAdapter(LikeSocketService.#pubClient, LikeSocketService.#subClient));
            LikeSocketService.#io = this;
            console.log('Socket Server Created');
            this.socketUserRedisRepository = new SocketUserRedisRepository();
        } catch (error) {
            console.log(error);
        }


    }

    #getLikeNamespace() {
        return this.io.of('/api/likes/socket');
    }

    async socketConnection() {
        try {
            const likeNamespace = this.#getLikeNamespace();
            console.log('Socket connection established');
            likeNamespace.use(socketValidator);
            likeNamespace.on('connection', async (socket) => {
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
                    likeNamespace.sockets.sockets.forEach(async (socket) => {
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
            const likeNamespace = this.#getLikeNamespace();
            if (socketId) {
                likeNamespace.to(socketId).emit(event, data);
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }

    }
    emitNotificationToAll({event, data}) {
        try {
            const likeNamespace = this.#getLikeNamespace();
            likeNamespace.emit(event, data);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }


    async disconnect() {
        try {
            if (LikeSocketService.#io) {
                await this.io?.close();
                LikeSocketService.#io = null;
            }
            if (LikeSocketService.#server) {
                LikeSocketService.#server?.close(); // Close the HTTP server
                LikeSocketService.#server = null;
            }
            if (LikeSocketService.#pubClient) {
                await LikeSocketService.#pubClient.quit();
                LikeSocketService.#pubClient = null;
            }
            if (LikeSocketService.#subClient) {
                await LikeSocketService.#subClient.quit();
                LikeSocketService.#subClient = null;
            }

        } catch (error) {
            console.log(error);
        }
    }


}

const gracefullyShutdown = async () => {
    try {
        const likeSocketService = new LikeSocketService();
        await likeSocketService.disconnect();
        console.log('Gracefully shutting down socket server');
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

process.on('SIGINT', gracefullyShutdown);

process.on('SIGTERM', gracefullyShutdown);

process.on('exit', gracefullyShutdown);

module.exports = LikeSocketService;