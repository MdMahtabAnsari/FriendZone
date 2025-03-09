const PostRepository = require('../repositories/post-repository');
const BadRequestError = require('../utils/errors/bad-request-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const ImageQueueService = require('./queue/image-queue-service');
const UnAuthorizedError = require('../utils/errors/un-authorized-error');
const NotFoundError = require('../utils/errors/not-found-error');
const AppError = require('../utils/errors/app-error');
const Producer = require('./rabbitmq/producer');
const PostGraphRepository = require('../repositories/graph/post-graph-repository');
const PostRedisRepository = require('../repositories/redis/post-redis-repository');

class PostService {
    constructor() {
        this.postRepository = new PostRepository();
        this.imageQueueService = new ImageQueueService();
        this.producer = new Producer();
        this.postGraphRepository = new PostGraphRepository();
        this.postRedisRepository = new PostRedisRepository();
    }

    async createPost({userId, content, tags, media}) {
        try {
            if (!content && !media && !tags) {
                throw new BadRequestError("Content or tags or media is required to create a post");
            }
            const post = await this.postRepository.createPost({userId, content, tags});
            if (media.length) {

                await this.imageQueueService.imageUploadEvent({postId: post?._id, media: media, userId});
            } else {
                await this.producer.sendToQueue('graph-post-queue', {
                    _id: post._id,
                    userId: post.userId,
                    content: post.content,
                    action: 'create',
                    tags: post.tags,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
                });
            }
            return post;
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

    async updatePost({postId, userId, content, tags, images, videos, media}) {
        try {
            const isValidPost = await this.postRepository.getPostById(postId);
            if (isValidPost?.userId?.toString() !== userId) {
                throw new UnAuthorizedError("You are not authorized to update this post");
            }
            const post = await this.postRepository.updatePost({
                postId,
                userId,
                content,
                tags,
                images,
                videos
            }, {service: true});
            if (media) {
                await this.imageQueueService.imageUploadEvent({postId: post?._id, media: media, userId});
            } else {
                await this.producer.sendToQueue('graph-post-queue', {
                    _id: post._id,
                    content: post.content,
                    tags: post.tags,
                    images: post.images,
                    videos: post.videos,
                    action: 'update',
                    updatedAt: post.updatedAt
                });
            }
            return post;
        } catch (error) {

            if (error instanceof AppError) {
                throw error;
            } else if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((error) => error.message);
                throw new BadRequestError(errors);
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getRandomPosts() {
        try {
            return await this.postRepository.getRandomPosts();
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUsersPosts({userId, page, limit}) {
        try {
            return await this.postRepository.getUsersPosts({userId, page, limit});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async deletePost({postId, userId}) {
        try {
            const isValidPost = await this.postRepository.getPostById(postId);
            if (!isValidPost) {
                throw new NotFoundError("Post");
            }
            if (isValidPost?.userId.toString() !== userId) {
                throw new UnAuthorizedError("You are not authorized to delete this post");
            }
            await this.postRepository.deletePost(postId);
            await this.producer.sendToQueue('graph-post-queue', {_id: postId, action: 'delete'});
            const cachedCount = await this.postRedisRepository.getUserPostsCount(userId);
            if (cachedCount) {
                await this.postRedisRepository.saveUserPostsCount({userId, count: cachedCount - 1});
            }
            return {_id: postId,userId: userId};
        } catch (error) {

            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getPostById(postId) {
        try {
            return await this.postRepository.getPostById(postId);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async getPosts({page, limit}) {
        try {
            return await this.postRepository.getPosts({page, limit});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getPostsByContent({content, page, limit}) {
        try {
            return await this.postRepository.getPostsByContent({content, page, limit});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }


    async getPostsByTag({tags, page, limit}) {
        try {
            return await this.postRepository.getPostsByTags({tags, page, limit});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getEnhancedRecommendations({userId, page, limit}) {
        try {
            return await this.postGraphRepository.getEnhancedRecommendations({userId, page, limit});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async isPostExists(postId) {
        try {
            const post = await this.postRepository.isPostExist(postId);
            if (!post) {
                throw new NotFoundError("Post");
            }
            return post;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUserIdByPostId(postId) {
        try {
            const post = await this.postRepository.getUserIdByPostId(postId);
            if (!post) {
                throw new NotFoundError("Post");
            }
            return post;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUserPostsCount(userId) {
        try {
            const cachedCount = await this.postRedisRepository.getUserPostsCount(userId);
            if (cachedCount) {
                return {
                    userId: userId,
                    count: cachedCount,
                }
            }
            const count = await this.postRepository.getUserPostsCount(userId);
            await this.postRedisRepository.saveUserPostsCount({userId, count});
            return {
                userId: userId,
                count: count,
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

}

module.exports = PostService;