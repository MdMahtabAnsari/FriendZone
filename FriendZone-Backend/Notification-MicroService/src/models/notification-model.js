const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    type: {
        type: String,
        enum: ['post', 'comment', 'user'],
        required: [true, 'Type of notification is required'],
    },
    action: {
        type: String,
        enum: ['like', 'dislike', 'follow', 'comment', 'reply'],
        required: [true, 'Action of notification is required'],
    },
    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User who triggered the notification is required'],
    }
}, {timestamps: true});

notificationSchema.index({userId: 1});
notificationSchema.index({isRead: 1});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
