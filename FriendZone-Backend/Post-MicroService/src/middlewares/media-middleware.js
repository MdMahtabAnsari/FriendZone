const {MULTER_IMAGE_MAX_SIZE, MULTER_VIDEO_MAX_SIZE} = require('../configs/server-config');
const BadRequestError = require('../utils/errors/bad-request-error');
const fs = require('fs');


const isMediaSizeValid = (req, res, next) => {
    const {files} = req;
    try {
        if (files.length) {
            for (const media of files) {
                if (media.mimetype?.includes('image') && media.size > MULTER_IMAGE_MAX_SIZE) {
                    throw new BadRequestError(`Image size should be less than ${MULTER_IMAGE_MAX_SIZE / (1024 * 1024)} MB`);
                }
                if (media.mimetype?.includes('video') && media.size > MULTER_VIDEO_MAX_SIZE) {
                    throw new BadRequestError(`Video size should be less than ${MULTER_VIDEO_MAX_SIZE / (1024 * 1024)} MB`);
                }
            }
        }
        next();
    } catch (error) {
        console.log(error);
        for (const media of files) {
            if (fs.existsSync(media.path)) {
                fs.unlinkSync(media.path);
            }
        }
        next(error);
    }
}

module.exports = {isMediaSizeValid};