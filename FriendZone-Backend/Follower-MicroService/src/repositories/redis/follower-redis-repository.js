const RedisConnection = require('./redis-connection');

class FollowerRedisRepository {
    static #redis = null;

    constructor() {
        if (!FollowerRedisRepository.#redis) {
            FollowerRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = FollowerRedisRepository.#redis;
        this.redis.on('connect', () => {
            console.log('Redis connected');
        });
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getKey({id, type}) {
        return `follower-service:${type}:${id}`;
    }

   async saveFollowerCount({id, count}) {
        try {
            const key =  this.getKey({id, type: 'followers'});
            await this.redis.set(key, count);
            await this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getFollowerCount(id) {
        try {
            const key = this.getKey({id, type: 'followers'});
            const count = await this.redis.get(key);
            return count ? parseInt(count) : null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async getFollowingCount(id) {
        try {
            const key = this.getKey({id, type: 'following'});
            const count = await this.redis.get(key);
            return count ? parseInt(count) : null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async saveFollowingCount({id, count}) {
        try {
            const key = this.getKey({id, type: 'following'});
            await this.redis.set(key, count);
            await this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

}

module.exports = FollowerRedisRepository;