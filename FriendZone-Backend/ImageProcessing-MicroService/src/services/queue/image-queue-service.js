const Bull = require('bull');
const {REDIS_SECURE,REDIS_SERVICE_URL,REDIS_HOST} = require('../../configs/server-config');
const ObjectDetectionService = require('../object-detection-service');
const ImageProcessService = require('../image-processing-service');

class ImageQueueService {
    static #ImageQueue = null;

    constructor() {
        if (!ImageQueueService.#ImageQueue) {
            ImageQueueService.#ImageQueue = new Bull('imageProcessing-image-queue',REDIS_SERVICE_URL,{
                redis:{
                    tls:REDIS_SECURE ? {
                        servername: REDIS_HOST
                    } : null,
                }
            });

        }

        this.ImageQueue = ImageQueueService.#ImageQueue;
        this.ImageQueue.on('error', (error) => {
            console.log('Image Queue Error: ', error);
        });
        this.objectDetectionService = new ObjectDetectionService();
        this.imageProcessService = new ImageProcessService();
    }

    async addJob(jobData) {
        try {
            await this.ImageQueue.add(jobData, {
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: true,


            });
            console.log('Image Job Added to Queue');
        } catch (error) {
            console.log('Image Queue Error: ', error);

        }
    }

    async imageUploadEvent({id,path,type,parentPath}) {
        try {
            await this.addJob({id,path,type,parentPath});
            console.log('Image Job Added to Queue');
        } catch (error) {
            console.log(error);
        }
    }

    async processImageJob() {
        await this.ImageQueue.process(async (job, done) => {
            try {
                const {id,path,type,parentPath} = job.data;
               const tags = await this.objectDetectionService.processImage(path);
               if(type === 'image') {
                await this.imageProcessService.updateImageProcess({id,imageTags:tags});
               }
                else {
                    await this.imageProcessService.updateImageProcess({id,videoTags:tags,parentPath});
               }
                console.log('Image Job Done');
                done();

            } catch (error) {
                console.log('Graph Job Error: ', error);
                done(error);
            }
        });

    }

    async disconnect() {
        try {
            if (ImageQueueService.#ImageQueue) {
                await ImageQueueService.#ImageQueue.close();
                ImageQueueService.#ImageQueue = null;
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