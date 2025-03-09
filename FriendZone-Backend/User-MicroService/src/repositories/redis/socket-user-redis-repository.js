const RedisConnection = require('./redis-connection');

class SocketUserRedisRepository {
    static #redis = null;

    constructor() {
        if (!SocketUserRedisRepository.#redis) {
            SocketUserRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = SocketUserRedisRepository.#redis;
        this.redis.on('connect', () => {
            console.log('Redis connected');
        });
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getKey(id) {
        return `users:users:${id}`;
    }

    async saveUserSocketId({userId, socketId}) {
        try {
            const key = this.getKey(userId);
            await this.redis.set(key, socketId);
            this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getUserSocketId(userId) {
        try {
            const key = this.getKey(userId);
            return await this.redis.get(key);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteUserBySocketId(socketId) {
        try {

            const keys = await this.redis.keys(this.getKey('*'));
            for (const key of keys) {
                const value = await this.redis.get(key);
                if (value === socketId) {
                    await this.redis.del(key);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async resetExpiry(userId) {
        try {
            const key = this.getKey(userId);
            const isKeyExists = await this.redis.exists(key);
            if (!isKeyExists) {
                return false;
            }
            return await this.redis.expire(key, 3600);
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // async disconnect(){
    //     try {
    //         if(SocketUserRedisRepository.#redis){
    //             await SocketUserRedisRepository.#redis.disconnect();
    //             SocketUserRedisRepository.#redis = null;
    //         }
    //     }
    //     catch(error){
    //         console.log(error);
    //     }
    // }

}

// const gracefullyShutdown = async () => {
//     try {
//         const socketUserRedisRepository = new SocketUserRedisRepository();
//         await socketUserRedisRepository.disconnect();
//         console.log('Gracefully shutting down redis connection');
//         process.exit(0);
//     }
//     catch(error){
//         console.log(error);
//     }
// }
//
// process.on('SIGINT', gracefullyShutdown);
//
// process.on('SIGTERM', gracefullyShutdown);
//
// process.on('exit', gracefullyShutdown);

module.exports = SocketUserRedisRepository;