const nfsw = require('nsfwjs');
const InternalServerError = require('../utils/errors/internal-server-error');
const AppError = require('../utils/errors/app-error');
const fs = require('fs');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs');

const NSFW_CATEGORIES = {
    porn: 0.7,
    hentai: 0.7,
    sexy: 0.8,
};
class NfswDetectionService {
    static #model = null;

    static async #getModel() {
        if (!NfswDetectionService.#model) {
            try {
                NfswDetectionService.#model = await nfsw.load();
            } catch (error) {
                console.error('Model Loading Error: ', error);
                throw new InternalServerError('Failed to load the nsfw detection model.');
            }
        }
        return NfswDetectionService.#model;
    }

    async #readImageToTensor(imagePath) {
        try {
            const imageBuffer = await fs.promises.readFile(imagePath);
            const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true });
            const { width, height, channels } = info;

            return tf.tensor3d(new Uint8Array(data), [height, width, channels]);
        } catch (error) {
            console.error(`Error reading image to tensor for ${imagePath}: `, error);
            return null;
        }
    }
    isNFSW(predictions){

        console.log(predictions);

        return predictions.some(prediction => NSFW_CATEGORIES[prediction.className] && prediction.probability >= NSFW_CATEGORIES[prediction.className]);



    }

    async detectNFSWImage(imagePath) {
        let inputTensor;
        try {
            await fs.promises.access(imagePath);

            const model = await NfswDetectionService.#getModel();
            inputTensor = await this.#readImageToTensor(imagePath);

            if (!inputTensor) {
                throw new InternalServerError();
            }

            const predictions = await model.classify(inputTensor);
            return this.isNFSW(predictions);
        } catch (error) {
            console.error(`Image Processing Error for ${imagePath}: `, error);
            if(error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        }finally {
            if(inputTensor) {
                inputTensor.dispose();
            }
            await fs.promises.unlink(imagePath)
        }
    }
}

module.exports = NfswDetectionService;
