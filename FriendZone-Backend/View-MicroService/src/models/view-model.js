const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User Id is required']
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Post Id is required']
    },
    count: {
        type: Number,
        default: 1
    }
}, {timestamps: true});

viewSchema.index({postId: 1});
viewSchema.index({userId: 1});
const View = mongoose.model('View', viewSchema);

module.exports = View;
