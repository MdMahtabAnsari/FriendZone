const Follower = require('../models/follower-model');
const BadRequestError = require('../utils/errors/bad-request-error');
const InternalServerError = require('../utils/errors/internal-server-error');


class FollowerRepository {
    async createFollower({followerId, followingId}) {
        try {
            const isRecordExist = await Follower.findOne({followerId, followingId});
            if(isRecordExist) {
               return isRecordExist;
            }
            const follower = new Follower({followerId, followingId});
            await follower.save();
            return follower;
        } catch (error) {
            console.log(error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((error) => error.message);
                throw new BadRequestError(errors);
            } else {
                throw new InternalServerError();
            }
        }
    }

    async deleteFollower({followerId, followingId}) {
        try {
            return await Follower.findOneAndDelete({followerId, followingId});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getFollowersByUserId({userId, page = 1, limit = 10}) {
        try {
            return await Follower.find({followingId: userId} ).skip((page - 1) * limit).limit(limit);
        }
        catch (error) {
            console.log(error);
            throw new InternalServerError();
        }

    }

    async getFollowingByUserId({userId, page = 1, limit = 10}) {
        try {
            return await Follower.find({followerId: userId} ).skip((page - 1) * limit).limit(limit);
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async isFollowing({followerId, followingId}) {
        try {
            const isFollowing = await Follower.findOne({followerId, followingId});
            return !!isFollowing;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

        async getFollowingCountByUserId(userId) {
            try {
                return await Follower.countDocuments({followerId: userId});
            } catch (error) {
                console.log(error);
                throw new InternalServerError();
            }
        }

        async getFollowersCountByUserId(userId) {
            try {
                return await Follower.countDocuments({followingId: userId});
            } catch (error) {
                console.log(error);
                throw new InternalServerError();
            }
        }


}

module.exports = FollowerRepository;