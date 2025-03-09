const ImageProcess = require('../models/image-process-model');
const InternalServerError = require('../utils/errors/internal-server-error');
const BadRequestError = require('../utils/errors/bad-request-error');

class ImageProcessRepository {
    async createImageProcess({postId,totalMedia}) {
        try {
            return await ImageProcess.create({postId,totalMedia});
        } catch (error) {
            console.log(error);
            if(error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((value) => value.message);
                throw new BadRequestError(errors);
            }
            else {
                throw new InternalServerError();
            }
        }
    }

    async getImageProcessById(id) {
        try {
            return await ImageProcess.findById(id);
        } catch (error) {
            throw new InternalServerError('Error while getting image process', error);
        }
    }

    async updateImageProcess({id,imageTags,videoTags,totalProcessed,isProcessed}) {
        try {
            return await ImageProcess.findByIdAndUpdate(id,{imageTags,videoTags,totalProcessed,isProcessed},{new:true});
        } catch (error) {
            throw new InternalServerError('Error while updating image process', error);
        }
    }
}

module.exports = ImageProcessRepository;