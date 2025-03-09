const mongoose = require('mongoose');

const postLikeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Post ID is required'],
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

const PostLike = mongoose.model('PostLike', postLikeSchema);

module.exports = PostLike;
