const CommentLikeService = require('../services/comment-like-service');
const AppError = require('../utils/errors/app-error');
const commentLikeService = new CommentLikeService();

const likeComment = async (req, res) => {
    try {
        const {commentId} = req.params;
        const userId = req.user._id;
        const response = await commentLikeService.likeComment({commentId, userId});
        res.status(201).json({
            message: "Successfully liked comment",
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

const dislikeComment = async (req, res) => {
    try {
        const {commentId} = req.params;
        const userId = req.user._id;
        const response = await commentLikeService.dislikeComment({commentId, userId});
        res.status(201).json({
            message: "Successfully disliked comment",
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
        const {commentId} = req.params;
        const response = await commentLikeService.getLikeCount(commentId);
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
        const {commentId} = req.params;
        const response = await commentLikeService.getDislikeCount(commentId);
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
        const {commentId} = req.params;
        const userId = req.user._id;
        const response = await commentLikeService.removeLike({commentId, userId});
        res.status(200).json({
            message: "Successfully removed like",
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
        const {commentId} = req.params;
        const userId = req.user._id;
        const response = await commentLikeService.removeDislike({commentId, userId});
        res.status(200).json({
            message: "Successfully removed dislike",
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

const getCommentLikeAndDislike = async (req, res) => {
    try {
        const {commentId} = req.params;
        const userId = req.user._id;
        const response = await commentLikeService.getCommentLikeAndDislike({commentId, userId});
        res.status(200).json({
            message: "Successfully fetched like and dislike status",
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
    likeComment,
    dislikeComment,
    getLikeCount,
    getDislikeCount,
    removeLike,
    removeDislike,
    getCommentLikeAndDislike
}