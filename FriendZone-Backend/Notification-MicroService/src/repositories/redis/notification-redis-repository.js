const RedisConnection = require('./redis-connection');

class NotificationRedisRepository {
    static #redis = null;

    constructor() {
        if (!NotificationRedisRepository.#redis) {
            NotificationRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = NotificationRedisRepository.#redis;
        this.redis.on('connect', () => {
            console.log('Redis connected');
        });
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getKey(id) {
        return `notification-service:notifications:${id}`;
    }
    
    async saveNotificationCount({userId, count}) {
        try {
            const key = this.getKey(userId);
            await this.redis.set(key, count);
            this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    async getNotificationCount(userId) {
        try {
            const key = this.getKey(userId);
            const count = await this.redis.get(key);
            return count?parseInt(count):null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    
}

module.exports = NotificationRedisRepository;