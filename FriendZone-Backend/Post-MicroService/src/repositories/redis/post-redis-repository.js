const RedisConnection = require('./redis-connection');

class PostRedisRepository {
    static #redis = null;

    constructor() {
        if (!PostRedisRepository.#redis) {

            PostRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = PostRedisRepository.#redis;
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getKey(id) {
        return `post-service:posts:${id}`;
    }

    async saveUserPostsCount({userId, count}) {
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
    async getUserPostsCount(userId) {
        try {
            const key = this.getKey(userId);
            const count = await this.redis.get(key);
            return count ? parseInt(count) : null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

module.exports = PostRedisRepository;