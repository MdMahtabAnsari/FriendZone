const Redis = require('ioredis');
const {REDIS_SERVICE_URL} = require('../../configs/server-config');

class RedisConnection {
    static #redis = null;

    constructor() {
        if (!RedisConnection.#redis) {
            RedisConnection.#redis = new Redis(REDIS_SERVICE_URL);
        }
        this.redis = RedisConnection.#redis;
        this.redis.on('connect', () => {
            console.log('Redis connected');
        });
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getRedis() {
        return this.redis;
    }

    async disconnect() {
        try {
            await this.redis.disconnect();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }

    }
}

const graceFullShutdown = async () => {
    try {
        await new RedisConnection().disconnect();
        console.log('Redis disconnected');
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

process.on('SIGINT', graceFullShutdown);
process.on('SIGTERM', graceFullShutdown);
process.on('exit', graceFullShutdown);


module.exports = RedisConnection;