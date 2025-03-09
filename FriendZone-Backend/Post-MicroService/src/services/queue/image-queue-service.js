const bull = require('bull');
const cloudinary = require('../../configs/cloudinary-config')
const {REDIS_SECURE,REDIS_SERVICE_URL,REDIS_HOST} = require('../../configs/server-config');
const BadRequestError = require('../../utils/errors/bad-request-error');
// const InternalServerError = require('../../utils/errors/internal-server-error');
const PostRepository = require('../../repositories/post-repository');
const fs = require('fs');
const PostSocketService = require('../socket/post-socket-service');
const Producer = require('../rabbitmq/producer');

class ImageQueueService {
    static #imageQueue = null;

    constructor() {
        if (!ImageQueueService.#imageQueue) {
            ImageQueueService.#imageQueue = new bull('post-image-queue',REDIS_SERVICE_URL,{
                redis:{
                    tls:REDIS_SECURE ? {
                        servername: REDIS_HOST
                    } : null,
                }
            });
            ImageQueueService.#imageQueue.on('error', error => {
                console.log('Image Queue Error: ', error);
            });
        }
        this.imageQueue = ImageQueueService.#imageQueue;
        this.postRepository = new PostRepository();
        this.producer = new Producer();
        try {

            this.postSocketService = new PostSocketService();
            console.log("Post Socket Service Connected");
        } catch (error) {
            console.log('Post Socket Service Error: ', error);
            setTimeout(() => {
                console.log('Retrying to connect to Post Socket Service');
                this.postSocketService = new PostSocketService();

            }, 1000);
        }
    }

    async #addJob(jobData) {
        try {
            await this.imageQueue.add(jobData, {
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: true,


            });
            console.log('Image Job Added to Queue');
        } catch (error) {
            console.log('Image Queue Error: ', error);
        }
    }

    async imageUploadEvent({postId, media, userId}) {
        try {
            console.log("media", media);
            const validPath = media.filter((file) => {
                if (fs.existsSync(file.path)) {
                    return file
                }
            });
            if (validPath.length === 0) {
                throw new BadRequestError('Invalid Image Path');
            }
            await this.#addJob({postId, media: validPath, userId});
            console.log('Image Upload Event');
        } catch (error) {
            console.log('Image Upload Event Error: ', error);
            for (const file of media) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
    }

    async processImageUploadJob() {
        console.log('Image Upload Job executed');
        this.imageQueue.process(async (job) => {
            const {postId, media, userId} = job.data;
            console.log("media", media);
            try {
                const imageSecureLinks = [];
                const videoSecureLinks = [];
                console.log('Image Upload Job Started');
                for (const file of media) {
                    console.log('path', file);
                    try {
                        if (fs.existsSync(file.path)) {
                            const resourceType = file.mimetype.includes('video') ? 'video' : 'image';
                            if (resourceType === 'video') {
                                const result = await cloudinary.uploader.upload(file.path, {
                                    folder: `friend-zone/posts/${userId}/${postId}`,
                                    use_filename: true,
                                    unique_filename: true,
                                    resource_type: resourceType,
                                    transformation:[
                                        { width: 720, crop: "scale" },       // Set resolution for mobile
                                        { quality: "auto" },                 // Adjust quality
                                        { fetch_format: "auto" },            // Use best format for device
                                        { bitrate: "700k" }
                                    ]


                                });
                                console.log('Cloudinary Upload video Result: ', result);
                                videoSecureLinks.push(result.secure_url);


                            } else {
                                const result = await cloudinary.uploader.upload(file.path, {
                                    folder: `friend-zone/posts/${userId}/${postId}`,
                                    use_filename: true,
                                    unique_filename: true,
                                    resource_type: resourceType,
                                    transformation: [
                                        { width: 1080, crop: "scale" },     // Adjust width for social media
                                        { quality: "auto:eco" },            // Use eco mode for file size balance
                                        { fetch_format: "auto" },           // Best format based on device
                                        { dpr: "auto" }                     // Adjust for pixel density
                                    ]

                                });
                                console.log('Cloudinary Upload image Result: ', result);
                                imageSecureLinks.push(result.secure_url);

                            }
                            if (fs.existsSync(file.path)) {
                                fs.unlinkSync(file.path);
                            }

                        }
                    } catch (error) {
                        console.log('Image Upload Error: ', error);


                    }
                }
                console.log('Image Secure Links: ', imageSecureLinks);
                console.log('Video Secure Links: ', videoSecureLinks);

                const updatedPost = await this.postRepository.updatePost({
                    postId: postId,
                    images: imageSecureLinks,
                    videos: videoSecureLinks,

                });
                await this.postSocketService.emitNotification({
                    userId: userId,
                    event: 'post',
                    data: {
                        _id: updatedPost._id,
                        userId: updatedPost.userId,
                        content: updatedPost.content,
                        images: updatedPost.images,
                        videos: updatedPost.videos,
                        tags: updatedPost.tags,
                        updatedAt: updatedPost.updatedAt,
                        createdAt: updatedPost.createdAt,
                        __v: updatedPost.__v
                    }
                });
                if (updatedPost.isUpdated) {
                    await this.producer.sendToQueue('graph-post-queue', {
                        _id: updatedPost._id,
                        content: updatedPost.content,
                        images: updatedPost.images,
                        videos: updatedPost.videos,
                        tags: updatedPost.tags,
                        imageTags: updatedPost.imageTags,
                        VideosTags: updatedPost.videoTags,
                        action: 'update',
                        updatedAt: updatedPost.updatedAt
                    });
                } else {
                    await this.producer.sendToQueue('graph-post-queue', {
                        _id: updatedPost._id,
                        userId: updatedPost.userId,
                        content: updatedPost.content,
                        images: updatedPost.images,
                        videos: updatedPost.videos,
                        tags: updatedPost.tags,
                        imageTags: updatedPost.imageTags,
                        VideosTags: updatedPost.videoTags,
                        action: 'create',
                        createdAt: updatedPost.createdAt,
                        updatedAt: updatedPost.updatedAt
                    });
                }

                let mediaList = [];
                if (imageSecureLinks.length > 0) {
                    for(const image of imageSecureLinks){
                        mediaList.push({url:image,type:'image'});
                    }
                }
                if (videoSecureLinks.length > 0) {
                    for(const video of videoSecureLinks){
                        mediaList.push({url:video,type:'video'});
                    }
                }
                await this.producer.sendToImageOrNFSWProcessingQueue('image-process-input', {postId: updatedPost._id, media: mediaList});
                await this.producer.sendToImageOrNFSWProcessingQueue('nsfw-process-input', {postId: updatedPost._id, media: mediaList});


                console.log("Image Upload Job Completed");

            } catch (error) {
                console.log('Image Upload Job Error: ', error);
                for (const file of media) {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                }
            }
        });
    }
}

module.exports = ImageQueueService;