const ImageProcessingRepository = require('../repositories/image-process-repository');
const InternalServerError = require('../utils/errors/internal-server-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const AppError = require('../utils/errors/app-error');
const Producer = require('./rabbitmq/producer');
const fs = require('fs');
class ImageProcessingService {
    constructor() {
        this.imageProcessRepository = new ImageProcessingRepository();
        this.producer = new Producer();
    }

    async updateImageProcess({id,imageTags=[],videoTags=[],parentPath=null}) {
        try {
           const isExist = await this.imageProcessRepository.getImageProcessById(id);
              if(!isExist) {
                throw new BadRequestError('Invalid Image Process ID');
              }
            if (imageTags.length > 0) {
                isExist.imageTags = Array.from(new Set([...isExist.imageTags, ...imageTags]));
            }
            if (videoTags.length > 0) {
                isExist.videoTags = Array.from(new Set([...isExist.videoTags, ...videoTags]));
            }
                isExist.totalProcessed = isExist.totalProcessed + 1;
                if(isExist.totalProcessed === isExist?.totalMedia) {
                    isExist.isProcessed = true;
                    await this.producer.sendToQueue('image-process-output',{id:isExist?.postId, imageTags: isExist.imageTags, videoTags: isExist.videoTags});
                    if(parentPath) {
                        await fs.promises.rmdir(parentPath);
                    }
                }
                await this.imageProcessRepository.updateImageProcess({id,imageTags:isExist?.imageTags,videoTags:isExist?.videoTags,totalProcessed:isExist?.totalProcessed,isProcessed:isExist?.isProcessed});

        } catch (error) {

            if (error instanceof AppError) {
                throw error;
            }
            else {
                console.error('Error while updating image process: ', error);
                throw new InternalServerError();
            }
        }
    }

    async createImageProcess({postId,totalMedia}) {
        try {
            return await this.imageProcessRepository.createImageProcess({postId,totalMedia});
        } catch (error) {

            if (error instanceof AppError) {
                throw error;
            }
            else {
                console.error('Error while creating image process: ', error);
                throw new InternalServerError();
            }
        }
    }

}

module.exports = ImageProcessingService;