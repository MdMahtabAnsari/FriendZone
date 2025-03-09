const amqp = require('amqplib');
const {RABBITMQ_SERVICE_URL} = require('../../configs/server-config');
const AppError = require('../../utils/errors/app-error');
const MediaDownloadService = require('../media-download-service');
const NFSWRepository = require('../../repositories/nfsw-repository');
const BadRequestError = require('../../utils/errors/bad-request-error');
const NfswQueueService = require('../queue/nfsw-queue-service');
const {FRAME_RATE} = require('../../configs/server-config');
const path = require('path');


class Consumer {
    static #channel = null;
    static #connection = null;

    constructor() {

        this.mediaDownloadService = new MediaDownloadService();
        this.nfswRepository = new NFSWRepository();
        this.nfswQueueService = new NfswQueueService();

    }

    async #connect(retryCount = 0) {
        if (Consumer.#connection) {
            return Consumer.#connection;
        }
        try {
            Consumer.#connection = await amqp.connect(RABBITMQ_SERVICE_URL);
            console.log('RabbitMQ connected');
            return Consumer.#connection;
        } catch (error) {
            console.log('RabbitMQ connection error: ', error);
            retryCount++;
            if (retryCount < 5) {
                return await this.#connect(retryCount);
            } else {
                console.log('RabbitMQ connection failed');
                return null;
            }
        }
    }

    async #createChannel() {
        if (Consumer.#channel) {
            return Consumer.#channel;
        }
        try {
            const connection = await this.#connect();
            if (connection) {
                Consumer.#channel = await connection.createChannel();
                console.log('RabbitMQ channel created');
                return Consumer.#channel;
            }
        } catch (error) {
            console.log('Error creating RabbitMQ channel: ', error);
            return null;
        }
    }

    async consumeFromQueue(queueName) {
        try {
            const channel = await this.#createChannel();
            if (channel) {
                await channel.assertQueue(queueName, {durable: true});
                await channel.consume(queueName, async (message) => {
                    try {
                        const messageContent = JSON.parse(message.content.toString());
                        console.log('Message received from RabbitMQ: ', messageContent);
                       const {postId,media} = messageContent;
                        if(!postId || !media) {
                            throw new BadRequestError('Invalid message');
                        }
                        const isNFSW = await this.nfswRepository.getNFSWByPostId(postId);
                        if(isNFSW && isNFSW.isNFSW) {
                            console.log('Post is already marked as NFSW');
                            channel.ack(message);
                            return;
                        }
                        for(const {url,type} of media) {
                            try {
                                const createdId = await this.nfswRepository.createNFSW(postId);
                               if(type === 'image') {
                                const imagePath = await this.mediaDownloadService.imageDownload(url);
                                await this.nfswQueueService.NFSWUploadEvent({postId:createdId.postId,path:imagePath,type, parentPath:null});
                               }
                               else if(type === 'video') {

                                    const videoPath = await this.mediaDownloadService.videoDownload(url);
                                    const framesPath = await this.mediaDownloadService.convertVideoToFrames(videoPath, FRAME_RATE);
                                    const parentPath = framesPath.length>0 ? path.dirname(framesPath[0]) : null;

                                    for(const path of framesPath) {

                                        await this.nfswQueueService.NFSWUploadEvent({postId:createdId.postId,path:path,type, parentPath});

                                    }
                               }

                            } catch (error) {
                                console.log('Error processing media: ', error);

                            }
                        }
                        channel.ack(message);

                    } catch (error) {
                        if (error instanceof AppError) {
                            console.log('Error consuming message from RabbitMQ: ', error.message);
                            channel.nack(message, false, false);
                        } else {
                            console.log('Error consuming message from RabbitMQ: ', error);
                            channel.nack(message, false, true);
                        }
                    }
                });

            }
        } catch (error) {

            console.log('Error consuming message from RabbitMQ: ', error);

        }
    }

    async closeConnection() {
        try {
            if (Consumer.#channel) {
                await Consumer.#channel.close();
                Consumer.#channel = null;
                console.log('RabbitMQ channel closed');
            }
            if (Consumer.#connection) {
                await Consumer.#connection.close();
                Consumer.#connection = null;
                console.log('RabbitMQ connection closed');
            }
        } catch (error) {
            console.log('Error closing RabbitMQ connection: ', error);
        }
    }


}

const gracefulShutdown = async () => {
    console.log('Gracefully shutting down');
    const consumer = new Consumer();
    await consumer.closeConnection();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('exit', gracefulShutdown);

module.exports = Consumer;