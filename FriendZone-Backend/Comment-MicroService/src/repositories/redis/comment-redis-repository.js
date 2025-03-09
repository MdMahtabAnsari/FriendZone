const RedisConnection = require('./redis-connection');

class CommentRedisRepository {
    static #redis = null;

    constructor() {
        if (!CommentRedisRepository.#redis) {

            CommentRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = CommentRedisRepository.#redis;
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getKey(id) {
        return `comment-service:posts:${id}`;
    }

    async savePostCommentCount({postId, commentCount}) {
        try {
            const key = this.getKey(postId);
            await this.redis.set(key, commentCount);
            await this.redis.expire(key, 3600);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    async getPostCommentCount(postId) {
        try {
            const key = this.getKey(postId);
            const commentCount = await this.redis.get(key);
            return commentCount ? parseInt(commentCount) : null
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async deletePostCommentCount(postId) {
        try {
            const key = this.getKey(postId);
            await this.redis.del(key);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

}

module.exports = CommentRedisRepository;