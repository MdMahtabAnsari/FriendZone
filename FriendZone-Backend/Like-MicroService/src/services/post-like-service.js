const Producer = require('./rabbitmq/producer');
const PostLikeRepository = require('../repositories/post-like-repository');
const InternalServerError = require('../utils/errors/internal-server-error');
const PostLikeRedisRepository = require('../repositories/redis/post-like-redis-repository');


class PostLikeService {
    constructor() {
        this.producer = new Producer();
        this.postLikeRepository = new PostLikeRepository();
        this.postLikeRedisRepository = new PostLikeRedisRepository();
    }

    async likePost({postId, userId}) {
        try {
            await this.producer.sendToQueue('post-like', {userId, postId, type: 'post', action: 'like'});
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async dislikePost({postId, userId}) {
        try {
            await this.producer.sendToQueue('post-like', {userId, postId, type: 'post', action: 'dislike'});
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeLike({postId, userId}) {
        try {
            await this.producer.sendToQueue('post-like', {userId, postId, type: 'post', action: 'remove-like'});
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeDislike({postId, userId}) {
        try {
            await this.producer.sendToQueue('post-like', {userId, postId, type: 'post', action: 'remove-dislike'});
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getLikeCount(postId) {
        try {
            const cachedLikeCount = await this.postLikeRedisRepository.getPostLikeCount(postId);
            if (cachedLikeCount) {
                return {
                    postId,
                    likes: cachedLikeCount
                }
            }
            const likeCount = await this.postLikeRepository.getLikeCount(postId);
            await this.postLikeRedisRepository.savePostLikeCount({postId, likeCount});
            return {
                postId,
                likes: likeCount
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getDislikeCount(postId) {
        try {
            const cachedDislikeCount = await this.postLikeRedisRepository.getPostDislikeCount(postId);
            if (cachedDislikeCount) {
                return {
                    postId,
                    dislikes: cachedDislikeCount
                }
            }
            const dislikeCount = await this.postLikeRepository.getDislikeCount(postId);
            await this.postLikeRedisRepository.savePostDislikeCount({postId, dislikeCount});
            return {
                postId,
                dislikes: dislikeCount
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getPostLikeAndDislike({postId, userId}) {
        try {
            return await this.postLikeRepository.getPostLikeAndDislike({postId, userId});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

}

module.exports = PostLikeService;