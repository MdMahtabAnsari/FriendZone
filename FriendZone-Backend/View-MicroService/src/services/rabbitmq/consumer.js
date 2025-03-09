const amqp = require('amqplib');
const {RABBITMQ_SERVICE_URL} = require('../../configs/server-config');
const ViewGraphRepository = require('../../repositories/graph/view-graph-repository');
const ViewRepository = require('../../repositories/view-repository');
const AppError = require('../../utils/errors/app-error');
const NotFoundError = require('../../utils/errors/not-found-error');
const PostApi = require('../../utils/api/post-api');
const ViewSocketService = require('../socket/view-socket-service');
const ViewRedisRepository = require('../../repositories/redis/view-redis-repository');


class Consumer {
    static #channel = null;
    static #connection = null;

    constructor() {

        this.postApi = new PostApi();
        this.viewRepository = new ViewRepository();
        this.viewGraphRepository = new ViewGraphRepository();
        try {
            this.viewSocketService = new ViewSocketService();
        } catch (error) {
            console.log('Error creating socket connection: ', error);
            setTimeout(() => {
                this.viewSocketService = new ViewSocketService();
            }, 1000);
        }
        this.viewRedisRepository = new ViewRedisRepository();

    }

    async #connect(retryCount = 0) {
        if (Consumer.#connection) {
            return Consumer.#connection;
        }
        try {
            Consumer.#connection = await amqp.connect(RABBITMQ_SERVICE_URL);
            console.log('RabbitMQ connected');
            Consumer.#connection.on('error', () => {
                console.log('RabbitMQ connection error');

            });
            Consumer.#connection.on('close', () => {
                console.log('RabbitMQ connection closed');

            });
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
                        const post = await this.postApi.isPostExists({postId: messageContent.postId});
                        if (!post) {
                            throw new NotFoundError('Post not found');
                        }
                        const userViews = await this.viewRepository.createViewPost({
                            postId: messageContent.postId,
                            userId: messageContent.userId
                        });
                        await this.viewGraphRepository.createViewPost({
                            postId: messageContent.postId,
                            userId: messageContent.userId
                        });
                        if (userViews.count === 1) {
                            const cachedViews = await this.viewRedisRepository.getPostViews({postId: messageContent.postId});
                            if (!cachedViews) {
                                const views = await this.viewRepository.getViewsCount(messageContent.postId);
                                await this.viewRedisRepository.setPostViews({postId: messageContent.postId, views});
                                this.viewSocketService.emitNotificationToAll({
                                    event: 'view',
                                    data: {postId: messageContent.postId, views}
                                });
                            } else {
                                await this.viewRedisRepository.setPostViews({
                                    postId: messageContent.postId,
                                    views: cachedViews + 1
                                });
                                this.viewSocketService.emitNotificationToAll({
                                    event: 'view',
                                    data: {postId: messageContent.postId, views: cachedViews + 1}
                                });
                            }
                        }

                        channel.ack(message);

                    } catch (error) {
                        if (error instanceof AppError && error.statusCode?.toString()?.startsWith('4')) {
                            console.log('startWith 4')
                            console.log('Error processing message: ', error.message);
                            channel.nack(message, false, false);
                        } else {
                            console.log('Error processing message: ', error);
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