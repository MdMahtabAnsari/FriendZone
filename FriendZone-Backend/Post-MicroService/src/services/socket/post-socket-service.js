const {Server} = require('socket.io');
const {socketValidator} = require('../../validators/socket-validator');
const SocketUserRedisRepository = require('../../repositories/redis/socket-user-redis-repository');
const {createAdapter} = require("@socket.io/redis-adapter");
const {createClient} = require('ioredis');
const {REDIS_SERVICE_URL} = require('../../configs/server-config');
const corsConfig = require('../../configs/cors-config');


class PostSocketService {
    static #io = null;
    static #server = null;
    static #pubClient = null;
    static #subClient = null;

    constructor(server) {
        try {
            if (PostSocketService.#io) {
                return PostSocketService.#io;
            }

            if (server) {
                PostSocketService.#server = server;
            } else if (!PostSocketService.#server) {
                throw new Error('Server instance is required for the first initialization');
            }

            this.io = new Server(PostSocketService.#server, {
                path: '/api/posts/socket/socket.io/',
                pingInterval: 10000,//ping every 10 seconds
                pingTimeout: 5000,//disconnect if pong is not received in 5 seconds
                cors: corsConfig, // Allow only the client URL to connect
            });
            if (!PostSocketService.#pubClient) {
                PostSocketService.#pubClient = createClient(REDIS_SERVICE_URL);
            }
            if (!PostSocketService.#subClient) {
                PostSocketService.#subClient = PostSocketService.#pubClient.duplicate();
            }

            this.io.adapter(createAdapter(PostSocketService.#pubClient, PostSocketService.#subClient));
            PostSocketService.#io = this;
            console.log('Socket Server Created');
            this.socketUserRedisRepository = new SocketUserRedisRepository();
        } catch (error) {
            console.log(error);
        }


    }

    #getPostNamespace() {
        return this.io.of('/api/posts/socket');
    }

    async socketConnection() {
        try {
            const postNamespace = this.#getPostNamespace();
            console.log('Socket connection established');
            postNamespace.use(socketValidator);
            postNamespace.on('connection', async (socket) => {
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
                    postNamespace.sockets.sockets.forEach(async (socket) => {
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
            const postNamespace = this.#getPostNamespace();
            if (socketId) {
                postNamespace.to(socketId).emit(event, data);
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
            if (PostSocketService.#io) {
                await this.io?.close();
                PostSocketService.#io = null;
            }
            if (PostSocketService.#server) {
                PostSocketService.#server?.close(); // Close the HTTP server
                PostSocketService.#server = null;
            }
            if (PostSocketService.#pubClient) {
                await PostSocketService.#pubClient.quit();
                PostSocketService.#pubClient = null;
            }
            if (PostSocketService.#subClient) {
                await PostSocketService.#subClient.quit();
                PostSocketService.#subClient = null;
            }

        } catch (error) {
            console.log(error);
        }
    }


}

const gracefullyShutdown = async () => {
    try {
        const postSocketService = new PostSocketService();
        await postSocketService.disconnect();
        console.log('Gracefully shutting down socket server');
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

process.on('SIGINT', gracefullyShutdown);

process.on('SIGTERM', gracefullyShutdown);

process.on('exit', gracefullyShutdown);

module.exports = PostSocketService;