const Bull = require('bull');
const {REDIS_HOST, REDIS_SECURE,REDIS_SERVICE_URL} = require('../../configs/server-config');
const fs = require('fs');
const NotFoundError = require('../../utils/errors/not-found-error');
const cloudinary = require('../../configs/cloudinary-config');
const UserRedisRepository = require('../../repositories/redis/user-redis-repository');
const UserRepository = require('../../repositories/user-repository');
const UserGraphRepository = require('../../repositories/graph/user-graph-repository');
const UserSocketService = require('../socket/user-socket-service');
const GraphQueueService = require('./graph-queue-service');


class ImageQueueService {
    static #imageQueue = null;

    constructor() {
        if (!ImageQueueService.#imageQueue) {
            ImageQueueService.#imageQueue = new Bull('user-image-queue',REDIS_SERVICE_URL,{
                redis:{
                    tls:REDIS_SECURE ? {
                        servername: REDIS_HOST
                    } : null,
                }
            });


        }
        try {
            this.userSocketService = new UserSocketService();
        } catch (error) {
            console.log('Socket Connection Error: ', error);
            setTimeout(() => {
                this.userSocketService = new UserSocketService();
            }, 1000);
        }
        this.userRedisRepository = new UserRedisRepository();
        this.userRepository = new UserRepository();
        this.imageQueue = ImageQueueService.#imageQueue;
        this.userGraphRepository = new UserGraphRepository();
        this.imageQueue.on('error', (error) => {
            console.log('Image Queue Error: ', error);
        });
        this.graphQueueService = new GraphQueueService();
    }

    async addJob(jobData) {
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

    async imageUploadEvent({id, imagePath, action,timeZone}) {
        try {
            if (!fs.existsSync(imagePath)) {
                throw new NotFoundError('Image');
            }
            await this.addJob({id, imagePath, action,timeZone});
        } catch (error) {
            console.log(error);
        }
    }

    async processImageUploadJob() {
        await this.imageQueue.process(async (job, done) => {
            const {id, imagePath, action,timeZone} = job.data;
            try {

                if (!fs.existsSync(imagePath)) {
                    throw new NotFoundError('Image');
                }
                const result = await cloudinary.uploader.upload(imagePath, {
                    folder: `friend-zone/users/${id}`, // Organized folder for each user
                    use_filename: true,
                    unique_filename: false,
                    resource_type: 'image',

                });
                const updatedUser = await this.userRepository.updateUser({
                    _id: id,
                    image: result.secure_url
                }, {password: true});
                console.log('updated user:', updatedUser);
                const userWithoutPassword = updatedUser?.toObject();
                delete userWithoutPassword.password;
                if (action === 'create') {
                   await this.graphQueueService.graphUploadEvent({id:updatedUser?._id, name: updatedUser?.name, email: updatedUser?.email, dateOfBirth: updatedUser?.dateOfBirth,image: updatedUser?.image,gender:updatedUser?.gender,action: 'create',timeZone:timeZone,createdAt:updatedUser?.createdAt,bio:updatedUser?.bio});
                }
                else if (action === 'update') {
                    console.log({id, event: 'image-updated', data: updatedUser});
                    await this.userSocketService.emitNotification({
                        userId: id,
                        event: 'image-updated',
                        data: userWithoutPassword
                    });
                    await this.graphQueueService.graphUploadEvent({id:id, name: updatedUser?.name, email: updatedUser?.email, dateOfBirth: updatedUser?.dateOfBirth,image: updatedUser?.image,gender:updatedUser?.gender,action: 'update',timeZone:timeZone,createdAt:updatedUser?.createdAt,bio:updatedUser?.bio});
                    await this.userRedisRepository.saveUser(updatedUser);
                }
                console.log('Image Uploaded to Cloudinary');
                fs.unlinkSync(imagePath);
                console.log('Image Deleted from Server');
                done();
            } catch (error) {
                console.log('Image Queue Error: ', error);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
                done(error);
            }
        });

    }

    async disconnect() {
        try {
            if (ImageQueueService.#imageQueue) {
                await ImageQueueService.#imageQueue.close();
                ImageQueueService.#imageQueue = null;
            }
        } catch (error) {
            console.log('Image Queue Error: ', error);
        }
    }

}

const disconnectImageQueue = async () => {
    const imageQueueService = new ImageQueueService();
    await imageQueueService.disconnect();
    console.log('Image Queue Disconnected');
    process.exit(0);
}

process.on('SIGINT', disconnectImageQueue);

process.on('SIGTERM', disconnectImageQueue);

process.on('exit', disconnectImageQueue);

module.exports = ImageQueueService;