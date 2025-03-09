const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],

    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Post ID is required'],
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],

}, {timestamps: true});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;