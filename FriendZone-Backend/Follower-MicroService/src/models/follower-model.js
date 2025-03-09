const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Follower Id is required']
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Following Id is required']
    }
}, {timestamps: true});

followerSchema.index({followerId: 1, });
followerSchema.index({followingId: 1, });

const Follower = mongoose.model('Follower', followerSchema);

module.exports = Follower;