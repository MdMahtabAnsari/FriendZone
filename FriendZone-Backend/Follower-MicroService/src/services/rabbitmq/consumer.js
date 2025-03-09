const amqp = require('amqplib');
const {RABBITMQ_SERVICE_URL} = require('../../configs/server-config');
const FollowerGraphRepository = require('../../repositories/graph/follower-graph-repository');
const AppError = require('../../utils/errors/app-error');
const FollowerSocketService = require('../socket/follower-socket-service');
const Producer = require('./producer');
const FollowerRedisRepository = require('../../repositories/redis/follower-redis-repository');
const FollowerRepository = require('../../repositories/follower-repository');
const BadRequestError = require('../../utils/errors/bad-request-error');

class Consumer {
    static #channel = null;
    static #connection = null;

    constructor() {
        this.followerGraphRepository = new FollowerGraphRepository();
        this.followerRepository = new FollowerRepository();
        this.followerRedisRepository = new FollowerRedisRepository();
        this.producer = new Producer();
        try {
            this.followerSocketService = new FollowerSocketService();
        } catch (error) {
            console.log('Error creating follower socket service: ', error);
            setTimeout(() => {
                this.followerSocketService = new FollowerSocketService();
            }, 1000);
        }

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
                        if (messageContent.type === 'follow') {
                            const isFollowing = await this.followerRepository.isFollowing({
                                followerId: messageContent.followerId,
                                followingId: messageContent.followingId
                            });
                            if(isFollowing){
                                throw new BadRequestError('Already following');
                            }
                            const response = await this.followerRepository.createFollower({
                                followerId: messageContent.followerId,
                                followingId: messageContent.followingId
                            });
                            await this.followerGraphRepository.createFollower({
                                followerId: messageContent.followerId,
                                followingId: messageContent.followingId
                            });

                            await this.followerSocketService.emitNotification({
                                userId: messageContent.followerId,
                                event: 'follower',
                                data: response
                            });
                            const cachedFollowerCount = await this.followerRedisRepository.getFollowerCount(messageContent.followingId);
                            if (cachedFollowerCount) {
                                await this.followerRedisRepository.saveFollowerCount({
                                    id: messageContent.followingId,
                                    count: cachedFollowerCount + 1
                                });
                            }else{
                                const count = await this.followerRepository.getFollowersCountByUserId(messageContent.followingId);
                                await this.followerRedisRepository.saveFollowerCount({id: messageContent.followingId, count});
                            }
                            const cachedFollowingCount = await this.followerRedisRepository.getFollowingCount(messageContent.followerId);
                            if (cachedFollowingCount) {
                                await this.followerRedisRepository.saveFollowingCount({
                                    id: messageContent.followerId,
                                    count: cachedFollowingCount + 1
                                });
                            }
                            else{
                                const count = await this.followerRepository.getFollowingCountByUserId(messageContent.followerId);
                                await this.followerRedisRepository.saveFollowingCount({id: messageContent.followerId, count});
                            }
                        } else if (messageContent.type === 'unfollow') {
                           const isFollowing = await this.followerRepository.isFollowing({
                                followerId: messageContent.followerId,
                                followingId: messageContent.followingId
                            });
                            if(!isFollowing){
                                throw new BadRequestError('Not following');
                           }
                            await this.followerRepository.deleteFollower({
                                followerId: messageContent.followerId,
                                followingId: messageContent.followingId
                            });
                            await this.followerGraphRepository.deleteFollower({
                                followerId: messageContent.followerId,
                                followingId: messageContent.followingId
                            });
                            const cachedFollowerCount = await this.followerRedisRepository.getFollowerCount(messageContent.followingId);
                            if (cachedFollowerCount) {
                                await this.followerRedisRepository.saveFollowerCount({
                                    id: messageContent.followingId,
                                    count: cachedFollowerCount - 1
                                });
                            }else{
                                const count = await this.followerRepository.getFollowersCountByUserId(messageContent.followingId);
                                await this.followerRedisRepository.saveFollowerCount({id: messageContent.followingId, count});
                            }
                            const cachedFollowingCount = await this.followerRedisRepository.getFollowingCount(messageContent.followerId);
                            if (cachedFollowingCount) {
                                await this.followerRedisRepository.saveFollowingCount({
                                    id: messageContent.followerId,
                                    count: cachedFollowingCount - 1
                                });
                            }else{
                                const count = await this.followerRepository.getFollowingCountByUserId(messageContent.followerId);
                                await this.followerRedisRepository.saveFollowingCount({id: messageContent.followerId, count});
                            }
                        }

                        if (messageContent.type === 'follow') {

                            await this.producer.sendToQueue('notification', {
                                triggeredBy: messageContent.followerId,
                                userId: messageContent.followingId,
                                type: "user",
                                action: "follow"
                            });
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