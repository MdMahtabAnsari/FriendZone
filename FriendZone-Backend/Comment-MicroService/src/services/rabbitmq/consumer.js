const amqp = require('amqplib');
const {RABBITMQ_SERVICE_URL} = require('../../configs/server-config');
const CommentRepository = require('../../repositories/comment-repository');
const CommentRedisRepository = require('../../repositories/redis/comment-redis-repository');
const AppError = require('../../utils/errors/app-error');
const CommentSocketService = require('../socket/comment-socket-service');
const Producer = require('./producer');

class Consumer {
    static #channel = null;
    static #connection = null;

    constructor() {
        this.commentRepository = new CommentRepository();
        this.producer = new Producer();
        this.commentRedisRepository = new CommentRedisRepository();
        try {
            this.commentSocketService = new CommentSocketService();
        } catch (error) {
            console.log('Error creating CommentSocketService: ', error);
            setTimeout(() => {
                this.commentSocketService = new CommentSocketService();
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

                        if (messageContent.type === 'update') {
                            const {commentId, userId, postId, parentCommentId} = messageContent;
                            if (parentCommentId) {
                                await this.commentRepository.addReplyToComment({commentId: parentCommentId, replyId: commentId});
                                const parentComment = await this.commentRepository.getCommentById(parentCommentId);
                                if (parentComment) {
                                    await this.producer.sendToQueue('notification', {
                                        triggeredBy: userId,
                                        userId: parentComment.userId,
                                        postId: postId,
                                        commentId: commentId,
                                        type: 'comment',
                                        action: 'reply'
                                    });
                                }
                            } else {
                                await this.producer.sendToQueue('notification', {
                                    triggeredBy: userId,
                                    userId: messageContent.postUserId,
                                    postId: postId,
                                    commentId: commentId,
                                    type: 'post',
                                    action: 'comment'
                                });
                            }
                            const cachedCount = await this.commentRedisRepository.getPostCommentCount(postId);
                            if (cachedCount) {
                                await this.commentRedisRepository.savePostCommentCount({postId, commentCount: cachedCount + 1});
                                this.commentSocketService.emitNotificationToAll({event: 'comment-count', data: {postId, count:cachedCount + 1}});
                            }
                            else{
                                const count = await this.commentRepository.getCommentsCountByPostId(postId);
                                await this.commentRedisRepository.savePostCommentCount({postId, commentCount: count});
                                this.commentSocketService.emitNotificationToAll({event: 'comment-count', data: {postId, count}});
                            }


                        }
                        else if(messageContent.type === 'delete'){
                            const {commentId, postId,parentCommentId} = messageContent;
                            if (parentCommentId) {
                                await this.commentRepository.removeReplyFromComment({commentId: parentCommentId, replyId: commentId});
                            }
                            const cachedCount = await this.commentRedisRepository.getPostCommentCount(postId);
                            if (cachedCount) {
                                await this.commentRedisRepository.savePostCommentCount({postId, commentCount: cachedCount - 1});
                                this.commentSocketService.emitNotificationToAll({event: 'comment-count', data: {postId, count: cachedCount - 1}});
                            }
                            else{
                                const count = await this.commentRepository.getCommentsCountByPostId(postId);
                                await this.commentRedisRepository.savePostCommentCount({postId, commentCount: count});
                                this.commentSocketService.emitNotificationToAll({event: 'comment-count', data: {postId, count}});
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

    async consumeFromToxicQueue(queueName) {
        try {
            const channel = await this.#createChannel();
            if (channel) {
                await channel.assertQueue(queueName, {durable: true});
                await channel.consume(queueName, async (message) => {
                    try {
                        const messageContent = JSON.parse(message.content.toString());
                        console.log('Message received from RabbitMQ: ', messageContent);
                       const deletedComment =await this.commentRepository.deleteToxicComment({commentId: messageContent.commentId});
                        if(deletedComment){
                            const cachedCount = await this.commentRedisRepository.getPostCommentCount(deletedComment.postId);
                            if (cachedCount) {
                                await this.commentRedisRepository.savePostCommentCount({postId: deletedComment.postId, commentCount: cachedCount - 1});
                                this.commentSocketService.emitNotificationToAll({event: 'comment-count', data: {postId: deletedComment.postId, count: cachedCount - 1}});
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