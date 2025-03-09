const FollowerService = require('../services/follower-service');
const AppError = require('../utils/errors/app-error');
const followerService = new FollowerService();

const createFollower = async (req, res) => {
    try {
        const {followingId} = req.body;
        const followerId = req.user._id;
        const response = await followerService.createFollower({followerId, followingId});
        res.status(202).json({
            message: 'Request accepted',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const deleteFollower = async (req, res) => {
    try {
        const followingId = req.params?.userId;
        const followerId = req.user._id;
        const response = await followerService.deleteFollower({followerId, followingId});
        res.status(202).json({
            message: 'Request accepted',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getFollowersByUserId = async (req, res) => {
    try {
        const userId = req.params?.userId;
        const {page, limit} = req.query;
        const response = await followerService.getFollowersByUserId({userId, page, limit});
        res.status(200).json({
            message: 'Followers fetched successfully',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getFollowingByUserId = async (req, res) => {
    try {
        const userId = req.params?.userId;
        const {page, limit} = req.query;
        const response = await followerService.getFollowingByUserId({userId, page, limit});
        res.status(200).json({
            message: 'Following fetched successfully',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getFollowersCountByUserId = async (req, res) => {
    try {
        const userId =req?.params?.userId
        const response = await followerService.getFollowersCountByUserId(userId);
        res.status(200).json({
            message: 'Followers count fetched successfully',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getFollowingCountByUserId = async (req, res) => {
    try {
        const userId = req?.params?.userId;
        const response = await followerService.getFollowingCountByUserId(userId);
        res.status(200).json({
            message: 'Following count fetched successfully',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getFollowerSuggestions = async (req, res) => {
    try {
        const userId = req.user._id;
        const {page, limit} = req.query;
        const response = await followerService.getFollowerSuggestions({userId, page, limit});
        res.status(200).json({
            message: 'Follower suggestions fetched successfully',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getMutualFollowers = async (req, res) => {
    try {
        const userId = req.user._id;
        const otherUserId = req.params?.userId;
        const {page, limit} = req.query;
        const response = await followerService.getMutualFollowers({userId, otherUserId, page, limit});
        res.status(200).json({
            message: 'Mutual followers fetched successfully',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}
const isFollowing = async (req, res) => {
    try {
        const userId = req.user._id;
        const followingId = req.params?.userId;
        const response = await followerService.isFollowing({followerId: userId, followingId});
        res.status(200).json({
            message: 'Fetched successfully',
            success: true,
            data: response,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

module.exports = {
    createFollower,
    deleteFollower,
    getFollowersByUserId,
    getFollowingByUserId,
    getFollowersCountByUserId,
    getFollowingCountByUserId,
    getFollowerSuggestions,
    getMutualFollowers,
    isFollowing
}