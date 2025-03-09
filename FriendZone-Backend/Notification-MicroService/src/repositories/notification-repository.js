const Notification = require('../models/notification-model');
const InternalServerError = require('../utils/errors/internal-server-error');
const NotFoundError = require('../utils/errors/not-found-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const UnAuthorizedError = require('../utils/errors/un-authorized-error');
const AppError = require('../utils/errors/app-error');

class NotificationRepository {

    async createNotification({userId, message, postId, commentId, type, action, triggeredBy}) {
        try {
            return await Notification.create({userId, message, postId, commentId, type, action, triggeredBy});
        } catch (error) {
            console.log(error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((value) => value.message);
                throw new BadRequestError(errors);
            } else {
                throw new InternalServerError();
            }
        }

    }

    async getNotificationsByUserId({userId, page = 1, limit = 10}) {
        try {
            return await Notification.find({userId}).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }


    async markNotificationAsRead({notificationId, userId}) {
        try {
            const notification = await Notification.findById(notificationId);
            if (!notification) {
                throw new NotFoundError('Notification');
            }
            if (notification?.userId.toString() !== userId) {
                throw new UnAuthorizedError("unauthorized to mark notification as read");
            }
            notification.isRead = true;
            await notification?.save();
            return notification;
        } catch (error) {

            console.log(error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        }
    }

    async getNotificationCountByUserId({userId}) {
        try {
            return await Notification.countDocuments({userId, isRead: false});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }


}

module.exports = NotificationRepository