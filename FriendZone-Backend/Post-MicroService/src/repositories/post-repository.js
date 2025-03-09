const Post = require('../models/post-model');
const BadRequestError = require('../utils/errors/bad-request-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const NotFoundError = require('../utils/errors/not-found-error');
const AppError = require('../utils/errors/app-error');

class PostRepository {
    async createPost({userId, content, tags, videoTags, imageTags, images, videos}) {
        try {
            const post = new Post({userId, content, tags, videoTags, imageTags, images, videos});
            await post.save();
            return {
                _id: post?._id,
                userId: post?.userId,
                content: post?.content,
                tags: post?.tags,
                images: post?.images,
                videos: post?.videos,
                createdAt: post?.createdAt,
                updatedAt: post?.updatedAt,
                __v: post?.__v
            }
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

    async getUsersPosts({userId, page = 1, limit = 10}) {
        try {
            //    exclude isUpdated and isDeleted fields
            return await Post.find({userId, isDeleted: false}, {
                isUpdated: 0,
                isDeleted: 0,
                videoTags: 0,
                imageTags: 0
            }).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getPostById(postId) {
        try {
            const post = await Post.findById(postId);
            if (!post || post?.isDeleted === true) {
                throw new NotFoundError('Post')
            }
            return {
                _id: post?._id,
                userId: post?.userId,
                content: post?.content,
                tags: post?.tags,
                images: post?.images,
                videos: post?.videos,
                createdAt: post?.createdAt,
                updatedAt: post?.updatedAt,
                __v: post?.__v
            }
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }

    async deletePost(postId) {
        try {
            const post = await Post.findById(postId);
            post.isDeleted = true;
            await post?.save();
            return {
                _id: post?._id,
                userId: post?.userId,
                content: post?.content,
                tags: post?.tags,
                images: post?.images,
                videos: post?.videos,
                createdAt: post?.createdAt,
                updatedAt: post?.updatedAt,
                __v: post?.__v
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getDeletedPostById(postId) {
        try {
            const post = await Post.findById(postId);
            if(!post) {
                throw new NotFoundError('Post');
            }
            return {
                _id: post?._id,
                userId: post?.userId,
                content: post?.content,
                tags: post?.tags,
                images: post?.images,
                videos: post?.videos,
                createdAt: post?.createdAt,
                updatedAt: post?.updatedAt,
                __v: post?.__v
            }
        }catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getPosts({page = 1, limit = 10}) {
        try {
            return await Post.find({isDeleted: false}, {
                isUpdated: 0,
                isDeleted: 0,
                videoTags: 0,
                imageTags: 0
            }).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getPostsByContent({content, page = 1, limit = 10}) {
        try {
            // isDeleted and isUpdated fields are excluded
            return await Post.find({content: {$regex: content, $options: 'i'}, isDeleted: false}, {
                isUpdated: 0,
                isDeleted: 0,
                videoTags: 0,
                imageTags: 0
            }).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);

        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async updatePost({
                         postId,
                         content,
                         tags,
                         videoTags,
                         imageTags,
                         images = [],
                         videos = [],
                         isUpdated
                     }, {service = false} = {}) {
        try {
            console.log({postId, content, tags, videoTags, imageTags, images, videos, isUpdated});
            const post = await Post.findById(postId);
            if (!post || post?.isDeleted === true) {
                throw new NotFoundError('Post')
            }
            if (service) {
                post.content = content;
                post.tags = tags;
                post.images = images;
                post.videos = videos;
            } else {
                if (Array.isArray(videoTags) && videoTags.length) {
                    post.videoTags = Array.from(new Set([...post?.videoTags, ...videoTags]));
                }
                if (Array.isArray(imageTags) && imageTags.length) {

                    post.imageTags = Array.from(new Set([...post?.imageTags, ...imageTags]));
                }
                if (Array.isArray(images) && images.length) {
                    console.log(images)
                    post.images = [...post?.images, ...images];
                }
                if (Array.isArray(videos) && videos.length) {
                    console.log(videos)
                    post.videos = [...post?.videos, ...videos];
                }
                if (typeof isUpdated === 'boolean') {
                    post.isUpdated = isUpdated;
                }
            }
            await post?.save();
            if (service) {
                return {
                    _id: post?._id,
                    userId: post?.userId,
                    content: post?.content,
                    tags: post?.tags,
                    images: post?.images,
                    videos: post?.videos,
                    createdAt: post?.createdAt,
                    updatedAt: post?.updatedAt,
                    __v: post?.__v
                }
            }
            return post;

        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((error) => error.message);
                throw new BadRequestError(errors);
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getRandomPosts() {
        try {
            //     get 10 random posts exclude isDeleted and isUpdated fields and sort by createdAt
            return await Post.aggregate([{$match: {isDeleted: false}}, {$sample: {size: 10}}, {
                $project: {
                    isDeleted: 0,
                    isUpdated: 0,
                    videoTags: 0,
                    imageTags: 0
                }
            }]);


        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getPostsByTags({tags = [], page = 1, limit = 10}) {
        try {
            // Find posts by matching any of the tags in tags, videoTags, or imageTags and ensure isDeleted is false
            const regexTags = tags.map(tag => new RegExp(tag, 'i'));
            return await Post.find({$and: [{isDeleted: false}, {$or: [{tags: {$in: regexTags}}, {videoTags: {$in: regexTags}}, {imageTags: {$in: regexTags}}]}]}, {
                isUpdated: 0,
                isDeleted: 0,
                imageTags: 0,
                videoTags: 0
            }).sort({createdAt: -1}).skip((page - 1) * limit).limit(limit);
        } catch (error) {
            console.error(error);
            throw new InternalServerError();
        }
    }


    async isPostExist(postId) {
        try {
            const post = await Post.findById(postId);
            if (!post || post?.isDeleted === true) {
                return false;
            }
            return true;

        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUserIdByPostId(postId) {
        try {
            const post = await Post.findById(postId);
            if (!post || post?.isDeleted === true) {
                throw new NotFoundError('Post')
            }
            return {userId: post?.userId};
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new InternalServerError();
            }
        }
    }
    async getUserPostsCount(userId) {
        try {
            return await Post.countDocuments({userId:userId, isDeleted: false});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }


}

module.exports = PostRepository
