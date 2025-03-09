const PostLike = require('../models/post-like-model');
const NotFoundError = require('../utils/errors/not-found-error');
const AppError = require('../utils/errors/app-error');
const BadRequestError = require('../utils/errors/bad-request-error');

const InternalServerError = require('../utils/errors/internal-server-error');

class PostLikeRepository {

    async likePost({postId, userId}) {
        try {
            const postLike = await PostLike.findOne({postId: postId, userId: userId});
            if (postLike) {
                postLike.isLiked = true;
                postLike.isDisliked = false;
                await postLike?.save();
            } else {
                await PostLike.create({postId: postId, userId: userId, isLiked: true});
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeLike({postId, userId}) {
        try {
            const postLike = await PostLike.findOne({postId: postId, userId: userId});
            if (postLike) {
                postLike.isLiked = false;
                await postLike?.save();
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeDislike({postId, userId}) {
        try {
            const postLike = await PostLike.findOne({postId: postId, userId: userId});
            if (postLike) {
                postLike.isDisliked = false;
                await postLike?.save();
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async dislikePost({postId, userId}) {
        try {
            const postLike = await PostLike.findOne({postId: postId, userId: userId});
            if (postLike) {
                postLike.isLiked = false;
                postLike.isDisliked = true;
                await postLike?.save();
            } else {
                await PostLike.create({postId: postId, userId: userId, isDisliked: true});
            }
            return true;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getDislikeCount(postId) {
        try {
            return await PostLike.countDocuments({postId: postId, isDisliked: true});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getLikeCount(postId) {
        try {
            return await PostLike.countDocuments({postId: postId, isLiked: true});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getPostLikeAndDislike({postId, userId}) {
        try {
            return await PostLike.findOne({postId: postId, userId: userId});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

}

module.exports = PostLikeRepository;
