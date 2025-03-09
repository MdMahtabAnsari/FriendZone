const {Server} = require('socket.io');
const {socketValidator} = require('../../validators/socket-validator');
const SocketUserRedisRepository = require('../../repositories/redis/socket-user-redis-repository');
const {createAdapter} = require("@socket.io/redis-adapter");
const {createClient} = require('ioredis');
const {REDIS_SERVICE_URL} = require('../../configs/server-config');
const corsConfig = require('../../configs/cors-config')


class UserSocketService {
    static #io = null;
    static #server = null;
    static #pubClient = null;
    static #subClient = null;

    constructor(server) {
        try {
            if (UserSocketService.#io) {
                return UserSocketService.#io;
            }

            if (server) {
                UserSocketService.#server = server;
            } else if (!UserSocketService.#server) {
                throw new Error('Server instance is required for the first initialization');
            }

            this.io = new Server(UserSocketService.#server, {
                path: '/api/users/socket/socket.io/',
                pingInterval: 10000,//ping every 10 seconds
                pingTimeout: 5000,//disconnect if pong is not received in 5 seconds
                cors: corsConfig
            });
            if (!UserSocketService.#pubClient) {
                UserSocketService.#pubClient = createClient(REDIS_SERVICE_URL);
            }
            if (!UserSocketService.#subClient) {
                UserSocketService.#subClient = UserSocketService.#pubClient.duplicate();
            }

            this.io.adapter(createAdapter(UserSocketService.#pubClient, UserSocketService.#subClient));
            UserSocketService.#io = this;
            console.log('Socket Server Created');
            this.socketUserRedisRepository = new SocketUserRedisRepository();
        } catch (error) {
            console.log(error);
        }


    }

    #getUserNamespace() {
        return this.io.of('/api/users/socket');
    }

    async socketConnection() {
        try {
            console.log('Socket connection established');
            const userNamespace = this.#getUserNamespace();
            userNamespace.use(socketValidator);
            userNamespace.on('connection', async (socket) => {
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
                    userNamespace.sockets.sockets?.forEach(async (socket) => {
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
            const userNamespace = this.#getUserNamespace();
            if (socketId) {
                userNamespace.to(socketId).emit(event, data);
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
            if (UserSocketService.#io) {
                await this.io?.close();
                UserSocketService.#io = null;
            }
            if (UserSocketService.#server) {
                UserSocketService.#server?.close(); // Close the HTTP server
                UserSocketService.#server = null;
            }
            if (UserSocketService.#pubClient) {
                await UserSocketService.#pubClient.quit();
                UserSocketService.#pubClient = null;
            }
            if (UserSocketService.#subClient) {
                await UserSocketService.#subClient.quit();
                UserSocketService.#subClient = null;
            }

        } catch (error) {
            console.log(error);
        }
    }


}

const gracefullyShutdown = async () => {
    try {
        const userSocketService = new UserSocketService();
        await userSocketService.disconnect();
        console.log('Gracefully shutting down socket server');
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

process.on('SIGINT', gracefullyShutdown);

process.on('SIGTERM', gracefullyShutdown);

process.on('exit', gracefullyShutdown);

module.exports = UserSocketService;