const Producer = require('./rabbitmq/producer');

const CommentLikeRepository = require('../repositories/comment-like-repository');

const InternalServerError = require('../utils/errors/internal-server-error');

const CommentLikeRedisRepository = require('../repositories/redis/comment-like-redis-repository');


class CommentLikeService {
    constructor() {
        this.producer = new Producer();
        this.commentLikeRepository = new CommentLikeRepository();
        this.commentLikeRedisRepository = new CommentLikeRedisRepository();
    }

    async likeComment({commentId, userId}) {
        try {
            await this.producer.sendToQueue('comment-like', {userId, commentId, type: 'comment', action: 'like'});
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async dislikeComment({commentId, userId}) {
        try {
            await this.producer.sendToQueue('comment-like', {userId, commentId, type: 'comment', action: 'dislike'});
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeLike({commentId, userId}) {
        try {
            await this.producer.sendToQueue('comment-like', {
                userId,
                commentId,
                type: 'comment',
                action: 'remove-like'
            });
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeDislike({commentId, userId}) {
        try {
            await this.producer.sendToQueue('comment-like', {
                userId,
                commentId,
                type: 'comment',
                action: 'remove-dislike'
            });
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getLikeCount(commentId) {
        try {
            const cachedLikeCount = await this.commentLikeRedisRepository.getCommentLikeCount(commentId);
            if (cachedLikeCount) {
                return {
                    commentId,
                    likes: cachedLikeCount
                }
            }
            const likeCount = await this.commentLikeRepository.getLikeCount(commentId);
            await this.commentLikeRedisRepository.saveCommentLikeCount({commentId, likeCount});
            return {
                commentId,
                likes: likeCount
            }

        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getDislikeCount(commentId) {
        try {
            const cachedDislikeCount = await this.commentLikeRedisRepository.getCommentDislikeCount(commentId);
            if (cachedDislikeCount) {
                return {
                    commentId,
                    dislikes: cachedDislikeCount
                }
            }
            const dislikeCount = await this.commentLikeRepository.getDislikeCount(commentId);
            await this.commentLikeRedisRepository.saveCommentDislikeCount({commentId, dislikeCount});
            return {
                commentId,
                dislikes: dislikeCount
            }

        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getCommentLikeAndDislike({commentId, userId}) {
        try {
            return await this.commentLikeRepository.getCommentLikeAndDislike({commentId, userId});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }
}

module.exports = CommentLikeService;