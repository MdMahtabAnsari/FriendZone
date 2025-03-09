const NotificationService = require('../services/notification-service');
const AppError = require('../utils/errors/app-error');
const notificationService = new NotificationService();

const getNotificationsByUserId = async (req, res) => {
    try {
        const userId = req?.user?._id;
        const {page, limit} = req.query;
        const response = await notificationService.getNotificationsByUserId({userId, page, limit});
        res.status(200).json({
            message: "Successfully fetched notifications",
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

const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req?.user?._id;
        const {notificationId} = req.body;
        const response = await notificationService.markNotificationAsRead({notificationId, userId});
        res.status(200).json({
            message: "Successfully marked notification as read",
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

const unreadNotificationCount = async (req, res) => {
    try {
        const userId = req?.user?._id;
        const response = await notificationService.getNotificationCountByUserId({userId});
        res.status(200).json({
            message: "Successfully fetched notification count",
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
    getNotificationsByUserId,
    markNotificationAsRead,
    unreadNotificationCount
}