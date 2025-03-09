const CommentRepository = require('../repositories/comment-repository');
const Producer = require('./rabbitmq/producer');
const InternalServerError = require('../utils/errors/internal-server-error');
const AppError = require('../utils/errors/app-error');
const NotFoundError = require('../utils/errors/not-found-error');
const UnauthorizedError = require('../utils/errors/un-authorized-error');
const PostApi = require('../utils/api/post-api');
const CommentRedisRepository = require('../repositories/redis/comment-redis-repository');
class CommentService {
    constructor() {
        this.commentRepository = new CommentRepository();
        this.producer = new Producer();
        this.postApi = new PostApi();
        this.commentRedisRepository = new CommentRedisRepository();
    }

    async createComment({comment, userId, postId, parentCommentId}) {
        try {
            const post = await this.postApi.getUserIdByPostId({postId: postId});

            if (!post) {
                throw new NotFoundError('Post');
            }
            const newComment = await this.commentRepository.createComment({comment, userId, postId, parentCommentId});
            await this.producer.sendToQueue('comment', {
                commentId: newComment?._id,
                userId,
                postId,
                parentCommentId,
                postUserId: post.userId,
                type: 'update'
            });
            await this.producer.sendToSentimentQueue('sentiment', {
                commentId: newComment?._id,
                comment: newComment?.comment,
            })
            return newComment;
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        }
    }

    async updateComment({commentId, comment, userId}) {
        try {
            const isCommentExist = await this.commentRepository.getCommentById(commentId);
            if (!isCommentExist) {
                throw new NotFoundError('Comment');
            }
            if (isCommentExist?.userId.toString() !== userId) {
                throw new UnauthorizedError('You are not authorized to update this comment');
            }

           const updatedComment = await this.commentRepository.updateComment({commentId, comment});
            await this.producer.sendToSentimentQueue('sentiment', {
                commentId: updatedComment?._id,
                comment: updatedComment?.comment,
            })
            return updatedComment;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async deleteComment({commentId, userId}) {
        try {


            const isDeleted = await this.commentRepository.deleteComment({commentId, userId});
            if (isDeleted) {
                await this.producer.sendToQueue('comment', {
                    commentId,
                    postId: isDeleted.postId,
                    parentCommentId:isDeleted.parentCommentId,
                    type: 'delete'
                });
            }
            return isDeleted;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getCommentById(commentId) {
        try {
            return await this.commentRepository.getCommentById(commentId);
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getCommentsCountByPostId(postId) {
        try {
            const cachedCommentsCount = await this.commentRedisRepository.getPostCommentCount(postId);

            if(cachedCommentsCount){
                return {
                    postId,
                    count: cachedCommentsCount
                }
            }
            const commentCount = await this.commentRepository.getCommentsCountByPostId(postId);

            await this.commentRedisRepository.savePostCommentCount({postId, commentCount});
            return {
                postId,
                count: commentCount
            }

        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getCommentsByPostIdAndParentCommentId({postId, parentCommentId, page, limit}) {
        try {
            return await this.commentRepository.getCommentsByPostIdAndParentCommentId({
                postId,
                parentCommentId,
                page,
                limit
            });
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async isCommentExists(commentId) {
        try {
            const isCommentExist = await this.commentRepository.getCommentById(commentId);
            if (!isCommentExist) {
                throw new NotFoundError('Comment');
            }
            return isCommentExist;
        } catch (error) {
            console.log(error);
            throw new InternalServerError
        }
    }

    async getUserIdAndPostIdByCommentId(commentId) {
        try {
            const isCommentExist = await this.commentRepository.getCommentById(commentId);
            if (!isCommentExist) {
                throw new NotFoundError('Comment');
            }
            return {userId: isCommentExist.userId, postId: isCommentExist.postId};
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }


}

module.exports = CommentService;