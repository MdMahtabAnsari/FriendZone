const PostService = require('../services/post-service');
const AppError = require('../utils/errors/app-error');
const postService = new PostService();

const createPost = async (req, res) => {
    try {
        const {content, tags} = req.body;
        const userId = req?.user?._id;
        const media = req?.files;
        const post = await postService.createPost({userId, content, tags, media});
        res.status(201).json({
            message: "Post created successfully",
            success: true,
            data: post,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const updatePost = async (req, res) => {
    try {
        const {postId, content, tags, images, videos} = req.body;
        const userId = req?.user?._id;
        const media = req.files;
        const post = await postService.updatePost({postId, userId, content, tags, images, videos, media});
        res.status(200).json({
            message: "Post updated successfully",
            success: true,
            data: post,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const getRandomPosts = async (req, res) => {
    try {
        const posts = await postService.getRandomPosts();
        res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            data: posts,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const getUsersPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const {page, limit} = req.query;
        const posts = await postService.getUsersPosts({userId, page, limit});
        res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            data: posts,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const getPosts = async (req, res) => {
    try {
        const {page, limit} = req.query;
        const posts = await postService.getPosts({page, limit});
        res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            data: posts,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const getPostById = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await postService.getPostById(postId);
        res.status(200).json({
            message: "Post fetched successfully",
            success: true,
            data: post,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const deletePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;
        const response = await postService.deletePost({postId, userId});
        res.status(200).json({
            message: "Post deleted successfully",
            success: true,
            data: response,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const getPostsByContent = async (req, res) => {
    try {
        const {content, page, limit} = req.query;
        const posts = await postService.getPostsByContent({content, page, limit});
        res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            data: posts,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}
const getPostsByTag = async (req, res) => {
    try {
        const {tags, page, limit} = req.query;
        console.log(tags);
        const posts = await postService.getPostsByTag({tags, page, limit});
        res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            data: posts,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const getEnhancedRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const {page, limit} = req.query;
        const posts = await postService.getEnhancedRecommendations({userId, page, limit});
        res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            data: posts,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const isPostExists = async (req, res) => {
    try {

        const postId = req.params.postId;
        const post = await postService.isPostExists(postId);
        res.status(200).json({
            message: "Post exists",
            success: true,
            data: post,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const getUserIdByPostId = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = await postService.getUserIdByPostId(postId);
        res.status(200).json({
            message: "User Id fetched successfully",
            success: true,
            data: userId,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

const getUserPostsCount = async (req, res) => {
    try {
        const userId = req.params.userId;
        const response = await postService.getUserPostsCount(userId);
        res.status(200).json({
            message: "Posts count fetched successfully",
            success: true,
            data: response,
            error: null,
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: null,
                error: error,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: null,
                error: error,
            });
        }
    }
}

module.exports = {
    createPost,
    updatePost,
    getRandomPosts,
    getUsersPosts,
    getPosts,
    getPostById,
    deletePost,
    getPostsByContent,
    getPostsByTag,
    getEnhancedRecommendations,
    isPostExists,
    getUserIdByPostId,
    getUserPostsCount
};



