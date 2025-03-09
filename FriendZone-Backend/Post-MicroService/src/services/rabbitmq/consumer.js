const amqp = require('amqplib');
const {RABBITMQ_SERVICE_URL} = require('../../configs/server-config');
const AppError = require('../../utils/errors/app-error');
const PostGraphRepository = require('../../repositories/graph/post-graph-repository');
const PostRepository = require('../../repositories/post-repository');
const PostRedisRepository = require('../../repositories/redis/post-redis-repository');

class Consumer {
    static #channel = null;
    static #connection = null;

    constructor() {

        this.postGraphRepository = new PostGraphRepository();
        this.postRepository = new PostRepository();
        this.postRedisRepository = new PostRedisRepository();

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
                        if (messageContent.action === 'create') {
                            await this.postGraphRepository.createPost({
                                _id: messageContent._id,
                                userId: messageContent.userId,
                                content: messageContent.content,
                                images: messageContent.images,
                                videos: messageContent.videos,
                                tags: messageContent.tags,
                                createdAt: messageContent.createdAt,
                                updatedAt: messageContent.updatedAt
                            });
                            const tags = [...messageContent.tags, ...messageContent.imageTags, ...messageContent.VideosTags];
                            if (tags.length > 0) {
                                await this.postGraphRepository.PostTag({_id: messageContent._id, tags});
                            }

                            await this.postRepository.updatePost({postId: messageContent._id, isUpdated: true});
                            const cachedCount = await this.postRedisRepository.getUserPostsCount(messageContent.userId);
                            if (cachedCount) {
                                await this.postRedisRepository.saveUserPostsCount({
                                    userId: messageContent.userId,
                                    count: cachedCount + 1
                                });
                            }
                            else{
                                const count = await this.postRepository.getUserPostsCount(messageContent.userId);
                                await this.postRedisRepository.saveUserPostsCount({
                                    userId: messageContent.userId,
                                    count: count
                                });
                            }


                        } else if (messageContent.action === 'update') {
                            await this.postGraphRepository.updatePost({
                                _id: messageContent._id,
                                content: messageContent.content,
                                images: messageContent.images,
                                videos: messageContent.videos,
                                tags: messageContent.tags,
                                updatedAt: messageContent.updatedAt
                            });
                            const tags = [...messageContent.tags, ...messageContent.imageTags, ...messageContent.VideosTags];
                            if (tags.length > 0) {
                                await this.postGraphRepository.PostTag({_id: messageContent._id, tags});
                            }

                        } else if (messageContent.action === 'delete') {
                            await this.postGraphRepository.deletePost(messageContent._id);
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
    async consumeFromImageProcessedQueue(queueName) {
        try {
            const channel = await this.#createChannel();
            if (channel) {
                await channel.assertQueue(queueName, {durable: true});
                await channel.consume(queueName, async (message) => {
                    try {
                        const messageContent = JSON.parse(message.content.toString());
                        console.log('Message received from RabbitMQ: ', messageContent);
                        const {id, imageTags, videoTags} = messageContent;
                        const tags = [...imageTags, ...videoTags];
                        if(tags.length > 0) {
                            await this.postRepository.updatePost({postId: id, imageTags:imageTags, videoTags:videoTags});
                            await this.postGraphRepository.PostTag({_id: id, tags});
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

    async consumeFromNfSWQueue(queueName) {
        try {
            const channel = await this.#createChannel();
            if (channel) {
                await channel.assertQueue(queueName, {durable: true});
                await channel.consume(queueName, async (message) => {
                    try {
                        const messageContent = JSON.parse(message.content.toString());
                        console.log('Message received from RabbitMQ: ', messageContent);
                        const {postId} = messageContent;
                        const deletedPost = await this.postRepository.deletePost(postId);
                        await this.postGraphRepository.deletePost(postId);
                        const cachedCount = await this.postRedisRepository.getUserPostsCount(deletedPost.userId);
                        if (cachedCount) {
                            await this.postRedisRepository.saveUserPostsCount({userId:deletedPost.userId, count: cachedCount - 1});
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