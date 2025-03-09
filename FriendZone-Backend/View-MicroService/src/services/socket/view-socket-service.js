const {Server} = require('socket.io');
const {socketValidator} = require('../../validators/socket-validator');
const SocketUserRedisRepository = require('../../repositories/redis/socket-user-redis-repository');
const {createAdapter} = require("@socket.io/redis-adapter");
const {createClient} = require('ioredis');
const {REDIS_SERVICE_URL} = require('../../configs/server-config');
const corsConfig =  require('../../configs/cors-config');


class ViewSocketService {
    static #io = null;
    static #server = null;
    static #pubClient = null;
    static #subClient = null;

    constructor(server) {
        try {
            if (ViewSocketService.#io) {
                return ViewSocketService.#io;
            }

            if (server) {
                ViewSocketService.#server = server;
            } else if (!ViewSocketService.#server) {
                throw new Error('Server instance is required for the first initialization');
            }

            this.io = new Server(ViewSocketService.#server, {
                path: '/api/views/socket/socket.io/',
                pingInterval: 10000,//ping every 10 seconds
                pingTimeout: 5000,//disconnect if pong is not received in 5 seconds
                cors: corsConfig, // Allow only the client URL to connect
            });
            if (!ViewSocketService.#pubClient) {
                ViewSocketService.#pubClient = createClient(REDIS_SERVICE_URL);
            }
            if (!ViewSocketService.#subClient) {
                ViewSocketService.#subClient = ViewSocketService.#pubClient.duplicate();
            }

            this.io.adapter(createAdapter(ViewSocketService.#pubClient, ViewSocketService.#subClient));
            ViewSocketService.#io = this;
            console.log('Socket Server Created');
            this.socketUserRedisRepository = new SocketUserRedisRepository();
        } catch (error) {
            console.log(error);
        }


    }

    #getViewNamespace() {
        return this.io.of('/api/views/socket');
    }

    async socketConnection() {
        try {
            console.log('Socket connection established');
            const viewNamespace = this.#getViewNamespace();
            viewNamespace.use(socketValidator);
            viewNamespace.on('connection', async (socket) => {
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
                    viewNamespace.sockets.sockets.forEach(async (socket) => {
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
            const viewNamespace = this.#getViewNamespace();
            if (socketId) {
                viewNamespace.to(socketId).emit(event, data);
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
            const viewNamespace = this.#getViewNamespace();
            viewNamespace.emit(event, data);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async disconnect() {
        try {
            if (ViewSocketService.#io) {
                await this.io?.close();
                ViewSocketService.#io = null;
            }
            if (ViewSocketService.#server) {
                ViewSocketService.#server?.close(); // Close the HTTP server
                ViewSocketService.#server = null;
            }
            if (ViewSocketService.#pubClient) {
                await ViewSocketService.#pubClient.quit();
                ViewSocketService.#pubClient = null;
            }
            if (ViewSocketService.#subClient) {
                await ViewSocketService.#subClient.quit();
                ViewSocketService.#subClient = null;
            }

        } catch (error) {
            console.log(error);
        }
    }


}

const gracefullyShutdown = async () => {
    try {
        const viewSocketService = new ViewSocketService();
        await viewSocketService.disconnect();
        console.log('Gracefully shutting down socket server');
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

process.on('SIGINT', gracefullyShutdown);

process.on('SIGTERM', gracefullyShutdown);

process.on('exit', gracefullyShutdown);

module.exports = ViewSocketService;