const ViewService = require('../services/view-service');
const AppError = require('../utils/errors/app-error');
const viewService = new ViewService();

const createViewPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        const response = await viewService.createViewPost({userId, postId});
        res.status(201).json({
            message: "Successfully viewed post",
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

const getPostViews = async (req, res) => {
    try {
        const postId = req.params.id;
        const response = await viewService.getPostViews({postId});
        res.status(200).json({
            message: "Successfully retrieved post views",
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
    createViewPost,
    getPostViews
}