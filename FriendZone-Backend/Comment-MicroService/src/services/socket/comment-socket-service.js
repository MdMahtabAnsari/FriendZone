const {Server} = require('socket.io');
const {socketValidator} = require('../../validators/socket-validator');
const SocketUserRedisRepository = require('../../repositories/redis/socket-user-redis-repository');
const {createAdapter} = require("@socket.io/redis-adapter");
const {createClient} = require('ioredis');
const {REDIS_SERVICE_URL} = require('../../configs/server-config');
const corsConfig = require('../../configs/cors-config');


class CommentSocketService {
    static #io = null;
    static #server = null;
    static #pubClient = null;
    static #subClient = null;

    constructor(server) {
        try {
            if (CommentSocketService.#io) {
                return CommentSocketService.#io;
            }

            if (server) {
                CommentSocketService.#server = server;
            } else if (!CommentSocketService.#server) {
                throw new Error('Server instance is required for the first initialization');
            }

            this.io = new Server(CommentSocketService.#server, {
                path: '/api/comments/socket/socket.io/',
                pingInterval: 10000,//ping every 10 seconds
                pingTimeout: 5000,//disconnect if pong is not received in 5 seconds
                cors: corsConfig, // Allow only the client URL to connect
            });
            if (!CommentSocketService.#pubClient) {
                CommentSocketService.#pubClient = createClient(REDIS_SERVICE_URL);
            }
            if (!CommentSocketService.#subClient) {
                CommentSocketService.#subClient = CommentSocketService.#pubClient.duplicate();
            }

            this.io.adapter(createAdapter(CommentSocketService.#pubClient, CommentSocketService.#subClient));
            CommentSocketService.#io = this;
            console.log('Socket Server Created');
            this.socketUserRedisRepository = new SocketUserRedisRepository();
        } catch (error) {
            console.log(error);
        }


    }

    #getCommentNamespace() {
        return this.io.of('/api/comments/socket');
    }

    async socketConnection() {
        try {

            console.log('Socket connection established');
            const commentNamespace = this.#getCommentNamespace();
            commentNamespace.use(socketValidator);
            commentNamespace.on('connection', async (socket) => {
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
                    commentNamespace.sockets.sockets.forEach(async (socket) => {
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
            const commentNamespace = this.#getCommentNamespace();
            if (socketId) {
                commentNamespace.to(socketId).emit(event, data);
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
            const commentNamespace = this.#getCommentNamespace();
            commentNamespace.emit(event, data);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async disconnect() {
        try {
            if (CommentSocketService.#io) {
                await this.io?.close();
                CommentSocketService.#io = null;
            }
            if (CommentSocketService.#server) {
                CommentSocketService.#server?.close(); // Close the HTTP server
                CommentSocketService.#server = null;
            }
            if (CommentSocketService.#pubClient) {
                await CommentSocketService.#pubClient.quit();
                CommentSocketService.#pubClient = null;
            }
            if (CommentSocketService.#subClient) {
                await CommentSocketService.#subClient.quit();
                CommentSocketService.#subClient = null;
            }

        } catch (error) {
            console.log(error);
        }
    }


}

const gracefullyShutdown = async () => {
    try {
        const commentSocketService = new CommentSocketService();
        await commentSocketService.disconnect();
        console.log('Gracefully shutting down socket server');
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

process.on('SIGINT', gracefullyShutdown);

process.on('SIGTERM', gracefullyShutdown);

process.on('exit', gracefullyShutdown);

module.exports = CommentSocketService;