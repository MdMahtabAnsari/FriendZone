const RedisConnection = require('./redis-connection');

class PostLikeRedisRepository {
    static #redis = null;

    constructor() {
        if (!PostLikeRedisRepository.#redis) {

            PostLikeRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = PostLikeRedisRepository.#redis;
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getKey({id, type}) {
        return `like-service:posts:${type}:${id}`;
    }

    async savePostLikeCount({postId, likeCount}) {
        try {
            const key = this.getKey({id: postId, type: 'like'});
            await this.redis.set(key, likeCount);
            await this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    async savePostDislikeCount({postId, dislikeCount}) {
        try {
            const key = this.getKey({id: postId, type: 'dislike'});
            await this.redis.set(key, dislikeCount);
            await this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    async getPostLikeCount(postId) {
        try {
            const key = this.getKey({id: postId, type: 'like'});
            const likeCount = await this.redis.get(key);
            return likeCount ? parseInt(likeCount) : null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async getPostDislikeCount(postId) {
        try {
            const key = this.getKey({id: postId, type: 'dislike'});
            const dislikeCount = await this.redis.get(key);
            return dislikeCount ? parseInt(dislikeCount) : null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

module.exports = PostLikeRedisRepository;