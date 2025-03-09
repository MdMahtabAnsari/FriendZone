const CommentService = require('../services/comment-service');
const AppError = require('../utils/errors/app-error');
const commentService = new CommentService();

const createComment = async (req, res) => {
    try {

        const {comment, postId, parentCommentId} = req.body;
        const userId = req.user._id;

        const response = await commentService.createComment({comment, userId, postId, parentCommentId});
        res.status(202).json({
            message: "comment creation initiated successfully",
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

const updateComment = async (req, res) => {
    try {
        const {commentId, comment} = req.body;
        const userId = req.user._id;
        const response = await commentService.updateComment({commentId, comment, userId});
        res.status(200).json({
            message: "Successfully updated comment",
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

const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id;
        const response = await commentService.deleteComment({commentId, userId});
        res.status(200).json({
            message: "Comment deleted successfully",
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

const getCommentById = async (req, res) => {
    try {
        const commentId = req.params.id;
        const response = await commentService.getCommentById(commentId);
        res.status(200).json({
            message: "Successfully fetched comment",
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

const getCommentsCountByPostId = async (req, res) => {
    try {
        const postId = req.params.id;
        const response = await commentService.getCommentsCountByPostId(postId);
        res.status(200).json({
            message: "Successfully fetched comment count",
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

const getCommentsByPostIdAndParentCommentId = async (req, res) => {
    try {

        const postId = req.params.postId;
        const parentCommentId = req.params.parentCommentId === ':parentCommentId' ? null : req.params.parentCommentId;
        const {page, limit} = req.query;
        const response = await commentService.getCommentsByPostIdAndParentCommentId({
            postId,
            parentCommentId,
            page,
            limit
        });
        res.status(200).json({
            message: "Successfully fetched comments",
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

const isCommentExists = async (req, res) => {
    try {
        const commentId = req.params.id;
        const response = await commentService.isCommentExists(commentId);
        res.status(200).json({
            message: "Successfully fetched comment",
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

const getUserIdAndPostIdByCommentId = async (req, res) => {
    try {
        const commentId = req.params.id;
        const response = await commentService.getUserIdAndPostIdByCommentId(commentId);
        res.status(200).json({
            message: "Successfully fetched comment",
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
    createComment,
    updateComment,
    deleteComment,
    getCommentById,
    getCommentsCountByPostId,
    getCommentsByPostIdAndParentCommentId,
    isCommentExists,
    getUserIdAndPostIdByCommentId
}