const {Server} = require('socket.io');
const {socketValidator} = require('../../validators/socket-validator');
const SocketUserRedisRepository = require('../../repositories/redis/socket-user-redis-repository');
const {createAdapter} = require("@socket.io/redis-adapter");
const {createClient} = require('ioredis');
const {REDIS_SERVICE_URL} = require('../../configs/server-config');
const corsConfig = require('../../configs/cors-config');


class FollowerSocketService {
    static #io = null;
    static #server = null;
    static #pubClient = null;
    static #subClient = null;

    constructor(server) {
        try {
            if (FollowerSocketService.#io) {
                return FollowerSocketService.#io;
            }

            if (server) {
                FollowerSocketService.#server = server;
            } else if (!FollowerSocketService.#server) {
                throw new Error('Server instance is required for the first initialization');
            }

            this.io = new Server(FollowerSocketService.#server, {
                path: '/api/followers/socket/socket.io/',
                pingInterval: 10000,//ping every 10 seconds
                pingTimeout: 5000,//disconnect if pong is not received in 5 seconds
                cors: corsConfig // Allow only the client URL to connect
            });
            if (!FollowerSocketService.#pubClient) {
                FollowerSocketService.#pubClient = createClient(REDIS_SERVICE_URL);
            }
            if (!FollowerSocketService.#subClient) {
                FollowerSocketService.#subClient = FollowerSocketService.#pubClient.duplicate();
            }

            this.io.adapter(createAdapter(FollowerSocketService.#pubClient, FollowerSocketService.#subClient));
            FollowerSocketService.#io = this;
            console.log('Socket Server Created');
            this.socketUserRedisRepository = new SocketUserRedisRepository();
        } catch (error) {
            console.log(error);
        }


    }

    #getFollowerNamespace() {
        return this.io.of('/api/followers/socket');
    }

    async socketConnection() {
        try {
            console.log('Socket connection established');
            const followerNamespace = this.#getFollowerNamespace();
            followerNamespace.use(socketValidator);
            followerNamespace.on('connection', async (socket) => {
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
                    followerNamespace.sockets.sockets.forEach(async (socket) => {
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
            const followerNamespace = this.#getFollowerNamespace();
            if (socketId) {
                followerNamespace.to(socketId).emit(event, data);
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
            if (FollowerSocketService.#io) {
                await this.io?.close();
                FollowerSocketService.#io = null;
            }
            if (FollowerSocketService.#server) {
                FollowerSocketService.#server?.close(); // Close the HTTP server
                FollowerSocketService.#server = null;
            }
            if (FollowerSocketService.#pubClient) {
                await FollowerSocketService.#pubClient.quit();
                FollowerSocketService.#pubClient = null;
            }
            if (FollowerSocketService.#subClient) {
                await FollowerSocketService.#subClient.quit();
                FollowerSocketService.#subClient = null;
            }

        } catch (error) {
            console.log(error);
        }
    }


}

const gracefullyShutdown = async () => {
    try {
        const followerSocketService = new FollowerSocketService();
        await followerSocketService.disconnect();
        console.log('Gracefully shutting down socket server');
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

process.on('SIGINT', gracefullyShutdown);

process.on('SIGTERM', gracefullyShutdown);

process.on('exit', gracefullyShutdown);

module.exports = FollowerSocketService;