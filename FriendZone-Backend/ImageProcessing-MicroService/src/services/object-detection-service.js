const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const fs = require('fs');
const sharp = require('sharp');
const InternalServerError = require('../utils/errors/internal-server-error');
const AppError = require('../utils/errors/app-error');
const {PREDICTION_ACCURACY} = require('../configs/server-config');

class ObjectDetectionService {
    static #model = null;

    static async #getModel() {
        if (!ObjectDetectionService.#model) {
            try {
                ObjectDetectionService.#model = await cocoSsd.load();
            } catch (error) {
                console.error('Model Loading Error: ', error);
                throw new InternalServerError('Failed to load the object detection model.');
            }
        }
        return ObjectDetectionService.#model;
    }

    async #readImageToTensor(imagePath) {
        try {
            const imageBuffer = await fs.promises.readFile(imagePath);// Read image buffer from file path using fs module
            const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true });// Read image buffer and metadata info from sharp module
            const { width, height, channels } = info; // Get image dimensions

            // Create tensor from raw data
            return tf.tensor3d(new Uint8Array(data), [height, width, channels]);
        } catch (error) {
            console.error(`Error reading image to tensor for ${imagePath}: `, error);
            return null;
        }
    }

    async processImage(imagePath) {
        let inputTensor;
        try {
            await fs.promises.access(imagePath);

            const model = await ObjectDetectionService.#getModel(); // Load the model
            inputTensor = await this.#readImageToTensor(imagePath); // Read the image to tensor

            // Return early if tensor creation failed
            if (!inputTensor) {
                throw new InternalServerError();
            }

            // Perform object detection
            const predictions = await model.detect(inputTensor);

            return predictions
                .filter(prediction => prediction.score >= PREDICTION_ACCURACY)
                .map(prediction => prediction.class);
        } catch (error) {
            console.error(`Image Processing Error for ${imagePath}: `, error);
            if(error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        } finally {
            if (inputTensor) inputTensor.dispose(); // Dispose tensor only if it exists
            await fs.promises.unlink(imagePath).catch(err =>
                console.error(`Failed to delete image file at ${imagePath}: `, err)
            );
        }
    }
}

module.exports = ObjectDetectionService;
