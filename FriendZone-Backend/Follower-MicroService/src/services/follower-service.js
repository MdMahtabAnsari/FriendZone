const FollowerGraphRepository = require('../repositories/graph/follower-graph-repository');
const AppError = require('../utils/errors/app-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const NotFoundError = require('../utils/errors/not-found-error');
const Producer = require('./rabbitmq/producer');
const UserApi = require('../utils/api/user-api');
const FollowerRepository = require('../repositories/follower-repository');
const FollowerRedisRepository = require('../repositories/redis/follower-redis-repository');

class FollowerService {
    constructor() {
        this.followerGraphRepository = new FollowerGraphRepository();
        this.followerRepository = new FollowerRepository();
        this.followerRedisRepository = new FollowerRedisRepository();
        this.producer = new Producer();
        this.userApi = new UserApi();
    }

    async createFollower({followerId, followingId}) {
        try {
            console.log(followerId, followingId);
            const following = await this.userApi.getUserById({userId: followingId});
            if (!following) {
                throw new NotFoundError('Following User');
            }
            await this.producer.sendToQueue('follower', {type: 'follow', followerId, followingId});
            return {followerId, followingId};
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }

        }
    }

    async deleteFollower({followerId, followingId}) {
        try {
            const following = await this.userApi.getUserById({userId: followingId});
            if (!following) {
                throw new NotFoundError('Following User');
            }
            await this.producer.sendToQueue('follower', {type: 'unfollow', followerId, followingId});
            return {followerId, followingId};
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getFollowersByUserId({userId, page, limit}) {
        try {

            return await this.followerRepository.getFollowersByUserId({userId, page, limit});
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getMutualFollowers({userId, otherUserId, page, limit}) {
        try {
            const mutualFollower = await this.followerGraphRepository.getMutualFollowers({
                userId1: userId,
                userId2: otherUserId,
                page,
                limit
            });
            return {
                userId:otherUserId,
                mutualFollowers: mutualFollower
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getFollowerSuggestions({userId, page, limit}) {
        try {
            return await this.followerGraphRepository.getFollowerSuggestions({userId, page, limit});
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getFollowingCountByUserId(userId) {
        try {
            const cachedCount = await this.followerRedisRepository.getFollowingCount(userId);
            if (cachedCount) {
                return {
                    userId: userId,
                    count: cachedCount
                }
            }
            const count = await this.followerRepository.getFollowingCountByUserId(userId);
            await this.followerRedisRepository.saveFollowingCount({id: userId, count});
            return {
                userId: userId,
                count: count
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getFollowersCountByUserId(userId) {
        try {
            const cachedCount = await this.followerRedisRepository.getFollowerCount(userId);
            if (cachedCount) {
                return {
                    userId: userId,
                    count: cachedCount
                }
            }
            const count = await this.followerRepository.getFollowersCountByUserId(userId);
            await this.followerRedisRepository.saveFollowerCount({id: userId, count});
            return {
                userId: userId,
                count: count
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getFollowingByUserId({userId, page, limit}) {

        try {
            return await this.followerRepository.getFollowingByUserId({userId, page, limit});
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async isFollowing({followerId, followingId}) {
        try {
           const isFollow = await this.followerRepository.isFollowing({followerId, followingId});
           return {
                followingId,
                isFollowing: isFollow
           }
        } catch (error) {

            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }


}

module.exports = FollowerService;