const mongoose = require('mongoose');

//post schema for social media app microservice

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User Id is required'],
    },
    content: {
        type: String,
    },
    tags: {
        type: [String],
        default: []
    },
    videoTags: {
        type: [String],
        default: []
    },
    imageTags: {
        type: [String],
        default: []
    },
    images: {
        type: [String],
        default: []
    },
    videos: {
        type: [String],
        default: []
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isUpdated: {
        type: Boolean,
        default: false,
    },

}, {timestamps: true});

postSchema.index({tags: 1});
postSchema.index({videoTags: 1});
postSchema.index({imageTags: 1});
postSchema.index({isDeleted: 1});
postSchema.index({isUpdated: 1});
postSchema.index({userId: 1});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
