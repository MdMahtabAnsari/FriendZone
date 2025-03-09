const CommentLike = require('../models/comment-like-model');
const InternalServerError = require('../utils/errors/internal-server-error');

class CommentLikeRepository {

    async likeComment({commentId, userId}) {
        try {
            const commentLike = await CommentLike.findOne({commentId: commentId, userId: userId});
            if (commentLike) {
                commentLike.isLiked = true;
                commentLike.isDisliked = false;
                await commentLike?.save();
            } else {
                await CommentLike.create({commentId: commentId, userId: userId, isLiked: true});
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeLike({commentId, userId}) {
        try {
            const commentLike = await CommentLike.findOne({commentId: commentId, userId: userId});
            if (commentLike) {
                commentLike.isLiked = false;
                await commentLike?.save();
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeDislike({commentId, userId}) {
        try {
            const commentLike = await CommentLike.findOne({commentId: commentId, userId: userId});
            if (commentLike) {
                commentLike.isDisliked = false;
                await commentLike?.save();
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async dislikeComment({commentId, userId}) {
        try {
            const commentLike = await CommentLike.findOne({commentId: commentId, userId: userId});
            if (commentLike) {
                commentLike.isLiked = false;
                commentLike.isDisliked = true;
                await commentLike?.save();
            } else {
                await CommentLike.create({commentId: commentId, userId: userId, isDisliked: true});
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getDislikeCount(commentId) {
        try {
            return await CommentLike.countDocuments({commentId: commentId, isDisliked: true});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getLikeCount(commentId) {
        try {
            return await CommentLike.countDocuments({commentId: commentId, isLiked: true});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }


    async getCommentLikeAndDislike({commentId, userId}) {
        try {
            return await CommentLike.findOne({commentId: commentId, userId: userId});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }


}

module.exports = CommentLikeRepository;