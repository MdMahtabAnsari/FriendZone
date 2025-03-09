const PostLikeService = require('../services/post-like-service');
const AppError = require('../utils/errors/app-error');
const postLikeService = new PostLikeService();

const likePost = async (req, res) => {
    try {
        const {postId} = req.params;
        const userId = req.user._id;
        const response = await postLikeService.likePost({postId, userId});
        res.status(201).json({
            message: "Successfully liked post",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const dislikePost = async (req, res) => {
    try {
        const {postId} = req.params;
        const userId = req.user._id;
        const response = await postLikeService.dislikePost({postId, userId});
        res.status(201).json({
            message: "Successfully disliked post",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getLikeCount = async (req, res) => {
    try {
        const {postId} = req.params;
        const response = await postLikeService.getLikeCount(postId);
        res.status(200).json({
            message: "Successfully fetched like count",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getDislikeCount = async (req, res) => {
    try {
        const {postId} = req.params;
        const response = await postLikeService.getDislikeCount(postId);
        res.status(200).json({
            message: "Successfully fetched dislike count",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const removeLike = async (req, res) => {
    try {
        const {postId} = req.params;
        const userId = req.user._id;
        const response = await postLikeService.removeLike({postId, userId});
        res.status(200).json({
            message: "Successfully removed like from post",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const removeDislike = async (req, res) => {
    try {
        const {postId} = req.params;
        const userId = req.user._id;
        const response = await postLikeService.removeDislike({postId, userId});
        res.status(200).json({
            message: "Successfully removed dislike from post",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getPostLikeAndDislike = async (req, res) => {
    try {
        const {postId} = req.params;
        const userId = req.user._id;
        const response = await postLikeService.getPostLikeAndDislike({postId, userId});
        res.status(200).json({
            message: "Successfully fetched like and dislike count",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

module.exports = {
    likePost,
    dislikePost,
    getLikeCount,
    getDislikeCount,
    removeLike,
    removeDislike,
    getPostLikeAndDislike
}