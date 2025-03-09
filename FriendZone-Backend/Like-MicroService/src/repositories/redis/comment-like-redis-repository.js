const RedisConnection = require('./redis-connection');

class CommentLikeRedisRepository {
    static #redis = null;

    constructor() {
        if (!CommentLikeRedisRepository.#redis) {

            CommentLikeRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = CommentLikeRedisRepository.#redis;
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getKey({id, type}) {
        return `like-service:comments:${type}:${id}`;
    }

    async saveCommentLikeCount({commentId, likeCount}) {
        try {
            const key = this.getKey({id: commentId, type: 'like'});
            await this.redis.set(key, likeCount);
            await this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    async saveCommentDislikeCount({commentId, dislikeCount}) {
        try {
            const key = this.getKey({id: commentId, type: 'dislike'});
            await this.redis.set(key, dislikeCount);
            await this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    async getCommentLikeCount(commentId) {
        try {
            const key = this.getKey({id: commentId, type: 'like'});
            const likeCount = await this.redis.get(key);
            return likeCount ? parseInt(likeCount) : null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async getCommentDislikeCount(commentId) {
        try {
            const key = this.getKey({id: commentId, type: 'dislike'});
            const dislikeCount = await this.redis.get(key);
           return dislikeCount ? parseInt(dislikeCount) : null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

module.exports = CommentLikeRedisRepository;