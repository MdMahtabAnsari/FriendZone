const amqp = require('amqplib');
const {RABBITMQ_SERVICE_URL} = require('../../configs/server-config');
const NotificationRepository = require('../../repositories/notification-repository');
const AppError = require('../../utils/errors/app-error');
const NotFoundError = require('../../utils/errors/not-found-error');
const NotificationSocketService = require('../socket/notification-socket-service');
const {
    postMessageTemplate,
    commentMessageTemplate,
    userMessageTemplate
} = require('../../utils/templates/notification-template');
const UserApi = require('../../utils/api/user-api');
const NotificationRedisRepository = require('../../repositories/redis/notification-redis-repository');

class Consumer {
    static #channel = null;
    static #connection = null;

    constructor() {
        this.notificationRepository = new NotificationRepository();
        this.userApi = new UserApi();
        try {
            this.notificationSocketService = new NotificationSocketService();
        } catch (error) {
            console.log('Error creating follower socket service: ', error);
            setTimeout(() => {
                this.notificationSocketService = new NotificationSocketService();
            }, 1000);
        }
        this.notificationRedisRepository = new NotificationRedisRepository();

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
                        if(messageContent?.userId === messageContent?.triggeredBy){
                            channel.ack(message);
                            return;
                        }
                        const triggeredUserDetails = await this.userApi.getUserById(messageContent.triggeredBy);
                        if (!triggeredUserDetails) {
                            throw new NotFoundError('User');
                        }
                        let isNotificationCountUpdated = false;
                        if (messageContent?.type === 'comment') {
                            const message = commentMessageTemplate({
                                action: messageContent.action,
                                triggeredBy: triggeredUserDetails?.name
                            });
                            const notification = await this.notificationRepository.createNotification(
                                {
                                    userId: messageContent?.userId,
                                    message: message,
                                    type: messageContent?.type,
                                    action: messageContent?.action,
                                    triggeredBy: messageContent?.triggeredBy,
                                    postId: messageContent?.postId,
                                    commentId: messageContent?.commentId

                                });
                            await this.notificationSocketService.emitNotification({
                                userId: messageContent?.userId,
                                event: 'notification',
                                data: notification
                            });
                            isNotificationCountUpdated = true;

                        } else if (messageContent?.type === 'post') {
                            const message = postMessageTemplate({
                                action: messageContent.action,
                                triggeredBy: triggeredUserDetails?.name
                            });
                            const notification = await this.notificationRepository.createNotification(
                                {
                                    userId: messageContent?.userId,
                                    message: message,
                                    type: messageContent?.type,
                                    action: messageContent?.action,
                                    triggeredBy: messageContent?.triggeredBy,
                                    postId: messageContent?.postId,
                                    commentId: messageContent?.commentId

                                });
                            await this.notificationSocketService.emitNotification({
                                userId: messageContent?.userId,
                                event: 'notification',
                                data: notification
                            });
                            isNotificationCountUpdated = true;
                        } else if (messageContent?.type === 'user') {
                            const message = userMessageTemplate({
                                action: messageContent.action,
                                triggeredBy: triggeredUserDetails?.name
                            });
                            const notification = await this.notificationRepository.createNotification(
                                {
                                    userId: messageContent?.userId,
                                    message: message,
                                    type: messageContent?.type,
                                    action: messageContent?.action,
                                    triggeredBy: messageContent?.triggeredBy,
                                    postId: messageContent?.postId,
                                    commentId: messageContent?.commentId

                                });
                            await this.notificationSocketService.emitNotification({
                                userId: messageContent?.userId,
                                event: 'notification',
                                data: notification
                            });
                            isNotificationCountUpdated = true;
                        }
                        if (isNotificationCountUpdated) {
                            const cachedCount = await this.notificationRedisRepository.getNotificationCount(messageContent?.userId);
                            if(cachedCount) {
                                await this.notificationRedisRepository.saveNotificationCount({
                                    userId: messageContent?.userId,
                                    count: cachedCount + 1
                                });
                            }else{
                                const count = await this.notificationRepository.getNotificationCountByUserId({userId: messageContent?.userId});
                                await this.notificationRedisRepository.saveNotificationCount({
                                    userId: messageContent?.userId,
                                    count: count
                                });
                            }
                        }
                        channel.ack(message);

                    } catch (error) {
                        if (error instanceof AppError && error.statusCode?.toString()?.startsWith('4')) {
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