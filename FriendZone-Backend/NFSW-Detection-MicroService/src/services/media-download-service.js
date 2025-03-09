const axios = require('axios');
const fs = require('fs');
const path = require('path');
const InternalServerError = require('../utils/errors/internal-server-error');
const NotFoundError = require('../utils/errors/not-found-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const AppError = require('../utils/errors/app-error');
const { pipeline } = require('stream/promises');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static'); // Import ffmpeg-static path
const { v4: uuidv4 } = require('uuid');
const { URL } = require('url');




class MediaDownloadService {

    constructor() {
        ffmpeg.setFfmpegPath(ffmpegPath);
    }
    async imageDownload(imageUrl) {
        try {
            if (!this.#isUrlValid(imageUrl)) {
                throw new BadRequestError('Invalid URL');
            }
            const downloadDir = path.join(process.cwd(), 'downloads');
            await fs.promises.mkdir(downloadDir, { recursive: true });

            const image = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            if (!image.data) {
                throw new NotFoundError('Image not found');
            }
            const extension = path.extname(imageUrl) || '.jpg';
            const imagePath = path.join(downloadDir, `${uuidv4()}${extension}`);
            await fs.promises.writeFile(imagePath, image.data);
            return imagePath;
        } catch (error) {
            console.log('Image Download Error:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        }
    }

    async videoDownload(videoUrl) {
        try {
            if (!this.#isUrlValid(videoUrl)) {
                throw new BadRequestError('Invalid URL');
            }
            const downloadDir = path.join(process.cwd(), 'downloads');
            await fs.promises.mkdir(downloadDir, { recursive: true });

            const video = await axios.get(videoUrl, { responseType: 'stream' });
            if (!video.data) {
                throw new NotFoundError('Video not found');
            }
            const extension = path.extname(videoUrl) || '.mp4';
            const videoPath = path.join(downloadDir, `${uuidv4()}${extension}`);
            const writer = fs.createWriteStream(videoPath);
            await pipeline(video.data, writer);
            return videoPath;
        } catch (error) {
            console.log('Video Download Error:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        }
    }

    async convertVideoToFrames(videoPath, frameRate) {
        try {
            const videoName = path.basename(videoPath, path.extname(videoPath));
            const framesDir = path.join(process.cwd(), 'frames', videoName);
            await fs.promises.mkdir(framesDir, { recursive: true });

            const outputImagePattern = path.join(framesDir, `${videoName}_${uuidv4()}_%03d.jpg`);
            await this.#processVideoToFrames(videoPath, frameRate, outputImagePattern);

            const frameFiles = await fs.promises.readdir(framesDir);
            const framePaths = frameFiles
                .filter(file => file.startsWith(videoName))
                .map(file => path.join(framesDir, file));

            await fs.promises.unlink(videoPath);
            return framePaths;
        } catch (error) {
            console.error('Frame Extraction Error:', error.message);
            throw new InternalServerError('Failed to extract frames from video: ' + error.message);
        }
    }

    async #processVideoToFrames(inputPath, frameRate, outputPattern) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([`-r ${frameRate}`, '-f image2'])
                .output(outputPattern)
                .on('end', () => resolve())
                .on('error', (error) => {
                    console.error('FFmpeg Processing Error:', error.message);
                    reject(new InternalServerError('FFmpeg processing error: ' + error.message));
                })
                .run();
        });
    }

    #isUrlValid(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = MediaDownloadService;
