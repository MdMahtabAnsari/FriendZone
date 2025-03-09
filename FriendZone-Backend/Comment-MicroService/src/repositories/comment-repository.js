const Comment = require('../models/comment-model');
const NotFoundError = require('../utils/errors/not-found-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const AppError = require('../utils/errors/app-error');
const UnauthorizedError = require("../utils/errors/un-authorized-error");

class CommentRepository {

    async getCommentById(commentId) {
        try {
            return await Comment.findById(commentId);
        } catch (error) {
            console.log(error);

            throw new InternalServerError();


        }
    }

    async createComment({comment, userId, postId, parentCommentId}) {
        try {
            const newComment = new Comment({comment, userId, postId, parentCommentId});
            await newComment.save();
            return newComment;

        } catch (error) {
            // console.log(error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((error) => error?.message);
                // console.log(errors);
                throw new BadRequestError(errors);
            } else if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }

    async addReplyToComment({commentId, replyId}) {
        try {
            const comment = await this.getCommentById(commentId);
            if (!comment) {
                throw new NotFoundError('Comment');
            }
            comment.replies.push(replyId);
            await comment.save();
            return true;
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }

    async removeReplyFromComment({commentId, replyId}) {
        try {
            const comment = await this.getCommentById(commentId);
            if (!comment) {
                throw new NotFoundError('Comment');
            }
            comment.replies.pull(replyId);
            await comment.save();
            return true;
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }

    async updateComment({commentId, comment}) {
        try {
            const isCommentExist = await this.getCommentById(commentId);
            if (!isCommentExist) {
                throw new NotFoundError('Comment');
            }
            if (isCommentExist?.replies.length > 0) {
                throw new BadRequestError('Comment has replies');
            }
            isCommentExist.comment = comment;
            await isCommentExist?.save();
            return isCommentExist;
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }

    }

    async deleteComment({commentId,userId}) {
        try {
            const isCommentExist = await this.getCommentById(commentId);
            if (!isCommentExist) {
                throw new NotFoundError('Comment');
            }
            if (isCommentExist?.userId.toString() !== userId) {
                throw new UnauthorizedError('You are not authorized to delete this comment');
            }
            if (isCommentExist?.replies.length > 0) {
                throw new BadRequestError('Comment has replies');
            }
            return await Comment.findByIdAndDelete(commentId)

        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }

    async deleteToxicComment({commentId}) {
        try{
            const isCommentExist = await this.getCommentById(commentId);
            if (!isCommentExist) {
                throw new NotFoundError('Comment');
            }
            return await Comment.findByIdAndDelete(commentId)
        }
        catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getCommentsCountByPostId(postId) {
        try {
            return await Comment.countDocuments({postId});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getCommentsByPostIdAndParentCommentId({postId, parentCommentId = null, page = 1, limit = 10}) {
        try {
            return await Comment.find({
                postId: postId,
                parentCommentId: parentCommentId
            }).sort({createdAt: 1}).skip((page - 1) * limit).limit(limit);
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async isCommentExist(commentId) {
        try {
            const comment = await this.getCommentById(commentId);
            return !!comment;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }


}

module.exports = CommentRepository;
