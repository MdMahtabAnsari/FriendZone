const mongoose = require('mongoose');

const commentLikeSchema = new mongoose.Schema({
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Comment ID is required'],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
    },
    isLiked: {
        type: Boolean,
        default: false,
    },
    isDisliked: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});

const CommentLike = mongoose.model('CommentLike', commentLikeSchema);

module.exports = CommentLike;