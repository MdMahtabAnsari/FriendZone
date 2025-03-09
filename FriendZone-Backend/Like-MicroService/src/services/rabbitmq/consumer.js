const amqp = require('amqplib');
const {RABBITMQ_SERVICE_URL} = require('../../configs/server-config');
const PostLikeRepository = require('../../repositories/post-like-repository');
const CommentLikeRepository = require('../../repositories/comment-like-repository');
const PostLikeGraphRepository = require('../../repositories/graph/post-like-graph-repository');
const AppError = require('../../utils/errors/app-error');
const NotFoundError = require('../../utils/errors/not-found-error');
const PostApi = require('../../utils/api/post-api');
const CommentApi = require('../../utils/api/comment-api');
const Producer = require('./producer');
const BadRequestError = require('../../utils/errors/bad-request-error');
const LikeSocketService = require('../socket/like-socket-service');
const CommentLikeRedisRepository = require('../../repositories/redis/comment-like-redis-repository');
const PostLikeRedisRepository = require('../../repositories/redis/post-like-redis-repository');


class Consumer {
    static #channel = null;
    static #connection = null;

    constructor() {
        this.postLikeRepository = new PostLikeRepository();
        this.commentLikeRepository = new CommentLikeRepository();
        this.postLikeGraphRepository = new PostLikeGraphRepository();
        this.postApi = new PostApi();
        this.commentApi = new CommentApi();
        this.producer = new Producer();
        try{
            this.likeSocketService = new LikeSocketService();
        }
        catch(error) {
            console.log('Error in LikeSocketService: ', error);
            setInterval(() => {
                this.likeSocketService = new LikeSocketService();
            }, 1000);
        }
        this.commentLikeRedisRepository = new CommentLikeRedisRepository();
        this.postLikeRedisRepository = new PostLikeRedisRepository();

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
                        if (messageContent?.type === 'post') {
                            const postLikeAndDislike = await this.postLikeRepository.getPostLikeAndDislike({
                                postId: messageContent.postId,
                                userId: messageContent.userId
                            });
                            if (postLikeAndDislike) {
                                if (messageContent.action === 'like' && postLikeAndDislike?.isLiked) {
                                    throw new BadRequestError('You have already liked this post');
                                }
                                if (messageContent.action === 'dislike' && postLikeAndDislike?.isDisliked) {
                                    throw new BadRequestError('You have already disliked this post');
                                }
                            }
                            const post = await this.postApi.getUserIdByPostId({postId: messageContent.postId});
                            if (!post) {
                                throw new NotFoundError('Post');
                            }
                            if (messageContent.action === 'like') {
                                await this.postLikeRepository.likePost({
                                    postId: messageContent.postId,
                                    userId: messageContent.userId
                                });
                                await this.postLikeGraphRepository.likePost({
                                    postId: messageContent.postId,
                                    userId: messageContent.userId
                                });
                                let likeCount = await this.postLikeRedisRepository.getPostLikeCount(messageContent.postId);
                                if (likeCount) {
                                    await this.postLikeRedisRepository.savePostLikeCount({postId: messageContent.postId, likeCount: likeCount + 1});
                                    this.likeSocketService.emitNotificationToAll({event:'post-like', data: {postId: messageContent.postId, likeCount: likeCount + 1}});
                                }
                                else {
                                    likeCount = await this.postLikeRepository.getLikeCount(messageContent.postId);
                                    await this.postLikeRedisRepository.savePostLikeCount({postId: messageContent.postId, likeCount: likeCount});
                                    this.likeSocketService.emitNotificationToAll({event:'post-like', data: {postId: messageContent.postId, likeCount: likeCount}});

                                }
                                if(postLikeAndDislike?.isDisliked) {
                                    let dislikeCount = await this.postLikeRedisRepository.getPostDislikeCount(messageContent.postId);
                                    if (dislikeCount) {
                                        await this.postLikeRedisRepository.savePostDislikeCount({postId: messageContent.postId, dislikeCount: dislikeCount - 1});
                                        this.likeSocketService.emitNotificationToAll({event:'post-dislike', data: {postId: messageContent.postId, dislikeCount: dislikeCount - 1}});
                                    }
                                    else {
                                        dislikeCount = await this.postLikeRepository.getDislikeCount(messageContent.postId);
                                        await this.postLikeRedisRepository.savePostDislikeCount({postId: messageContent.postId, dislikeCount: dislikeCount});
                                        this.likeSocketService.emitNotificationToAll({event:'post-dislike', data: {postId: messageContent.postId, dislikeCount: dislikeCount}});
                                    }
                                }

                                await this.producer.sendToQueue('notification', {
                                    triggeredBy: messageContent.userId,
                                    postId: messageContent.postId,
                                    userId: post.userId,
                                    type: 'post',
                                    action: 'like'
                                });
                            } else if (messageContent.action === 'dislike') {
                                await this.postLikeRepository.dislikePost({
                                    postId: messageContent.postId,
                                    userId: messageContent.userId
                                });
                                await this.postLikeGraphRepository.dislikePost({
                                    postId: messageContent.postId,
                                    userId: messageContent.userId
                                });
                                let dislikeCount = await this.postLikeRedisRepository.getPostDislikeCount(messageContent.postId);
                                if (dislikeCount) {
                                    await this.postLikeRedisRepository.savePostDislikeCount({postId: messageContent.postId, dislikeCount: dislikeCount + 1});
                                    this.likeSocketService.emitNotificationToAll({event:'post-dislike', data: {postId: messageContent.postId, dislikeCount: dislikeCount + 1}});
                                }
                                else {
                                    dislikeCount = await this.postLikeRepository.getDislikeCount(messageContent.postId);
                                    await this.postLikeRedisRepository.savePostDislikeCount({postId: messageContent.postId, dislikeCount: dislikeCount});
                                    this.likeSocketService.emitNotificationToAll({event:'post-dislike', data: {postId: messageContent.postId, dislikeCount: dislikeCount}});
                                }
                                if(postLikeAndDislike?.isLiked) {
                                    let likeCount = await this.postLikeRedisRepository.getPostLikeCount(messageContent.postId);
                                    if (likeCount) {
                                        await this.postLikeRedisRepository.savePostLikeCount({postId: messageContent.postId, likeCount: likeCount - 1});
                                        this.likeSocketService.emitNotificationToAll({event:'post-like', data: {postId: messageContent.postId, likeCount: likeCount - 1}});
                                    }
                                    else {
                                        likeCount = await this.postLikeRepository.getLikeCount(messageContent.postId);
                                        await this.postLikeRedisRepository.savePostLikeCount({postId: messageContent.postId, likeCount: likeCount});
                                        this.likeSocketService.emitNotificationToAll({event:'post-like', data: {postId: messageContent.postId, likeCount: likeCount}});
                                    }
                                }
                                await this.producer.sendToQueue('notification', {
                                    triggeredBy: messageContent.userId,
                                    postId: messageContent.postId,
                                    userId: post.userId,
                                    type: 'post',
                                    action: 'dislike'
                                });
                            } else if (messageContent.action === 'remove-like') {
                                await this.postLikeRepository.removeLike({
                                    postId: messageContent.postId,
                                    userId: messageContent.userId
                                });
                                await this.postLikeGraphRepository.removeLike({
                                    postId: messageContent.postId,
                                    userId: messageContent.userId
                                });

                                let likeCount = await this.postLikeRedisRepository.getPostLikeCount(messageContent.postId);
                                if (likeCount) {
                                    await this.postLikeRedisRepository.savePostLikeCount({postId: messageContent.postId, likeCount: likeCount - 1});
                                    this.likeSocketService.emitNotificationToAll({event:'post-like', data: {postId: messageContent.postId, likeCount: likeCount - 1}});
                                }
                                else {
                                    likeCount = await this.postLikeRepository.getLikeCount(messageContent.postId);
                                    await this.postLikeRedisRepository.savePostLikeCount({postId: messageContent.postId, likeCount: likeCount});
                                    this.likeSocketService.emitNotificationToAll({event:'post-like', data: {postId: messageContent.postId, likeCount: likeCount}});
                                }

                            } else if (messageContent.action === 'remove-dislike') {
                                await this.postLikeRepository.removeDislike({
                                    postId: messageContent.postId,
                                    userId: messageContent.userId
                                });
                                await this.postLikeGraphRepository.removeDislike({
                                    postId: messageContent.postId,
                                    userId: messageContent.userId
                                });
                                let dislikeCount = await this.postLikeRedisRepository.getPostDislikeCount(messageContent.postId);
                                if (dislikeCount) {
                                    await this.postLikeRedisRepository.savePostDislikeCount({postId: messageContent.postId, dislikeCount: dislikeCount - 1});
                                    this.likeSocketService.emitNotificationToAll({event:'post-dislike', data: {postId: messageContent.postId, dislikeCount: dislikeCount - 1}});
                                }
                                else {
                                    dislikeCount = await this.postLikeRepository.getDislikeCount(messageContent.postId);
                                    await this.postLikeRedisRepository.savePostDislikeCount({postId: messageContent.postId, dislikeCount: dislikeCount});
                                    this.likeSocketService.emitNotificationToAll({event:'post-dislike', data: {postId: messageContent.postId, dislikeCount: dislikeCount}});
                                }
                            }
                        } else if (messageContent.type === 'comment') {
                            const commentLikeAndDislike = await this.commentLikeRepository.getCommentLikeAndDislike({
                                commentId: messageContent.commentId,
                                userId: messageContent.userId
                            });
                            if (commentLikeAndDislike) {
                                if (messageContent.action === 'like' && commentLikeAndDislike?.isLiked) {
                                    throw new BadRequestError('You have already liked this comment');
                                }
                                if (messageContent.action === 'dislike' && commentLikeAndDislike?.isDisliked) {
                                    throw new BadRequestError('You have already disliked this comment');
                                }
                            }
                            const comment = await this.commentApi.getUserIdAndPostIdByCommentId({commentId: messageContent.commentId});
                            if (!comment) {
                                throw new NotFoundError('Comment');
                            }

                            if (messageContent.action === 'like') {
                                await this.commentLikeRepository.likeComment({
                                    commentId: messageContent.commentId,
                                    userId: messageContent.userId
                                });
                                let likeCount = await this.commentLikeRedisRepository.getCommentLikeCount(messageContent.commentId);
                                if (likeCount) {
                                    await this.commentLikeRedisRepository.saveCommentLikeCount({commentId: messageContent.commentId, likeCount: likeCount + 1});
                                    this.likeSocketService.emitNotificationToAll({event:'comment-like', data: {commentId: messageContent.commentId, likeCount: likeCount + 1}});
                                }
                                else {
                                    likeCount = await this.commentLikeRepository.getLikeCount(messageContent.commentId);
                                    await this.commentLikeRedisRepository.saveCommentLikeCount({commentId: messageContent.commentId, likeCount: likeCount});
                                    this.likeSocketService.emitNotificationToAll({event:'comment-like', data: {commentId: messageContent.commentId, likeCount: likeCount}});
                                }
                                if(commentLikeAndDislike?.isDisliked) {
                                    let dislikeCount = await this.commentLikeRedisRepository.getCommentDislikeCount(messageContent.commentId);
                                    if (dislikeCount) {
                                        await this.commentLikeRedisRepository.saveCommentDislikeCount({commentId: messageContent.commentId, dislikeCount: dislikeCount - 1});
                                        this.likeSocketService.emitNotificationToAll({event:'comment-dislike', data: {commentId: messageContent.commentId, dislikeCount: dislikeCount - 1}});
                                    }
                                    else {
                                        dislikeCount = await this.commentLikeRepository.getDislikeCount(messageContent.commentId);
                                        await this.commentLikeRedisRepository.saveCommentDislikeCount({commentId: messageContent.commentId, dislikeCount: dislikeCount});
                                        this.likeSocketService.emitNotificationToAll({event:'comment-dislike', data: {commentId: messageContent.commentId, dislikeCount: dislikeCount}});
                                    }
                                }
                                await this.producer.sendToQueue('notification', {
                                    triggeredBy: messageContent.userId,
                                    postId: comment.postId,
                                    userId: comment.userId,
                                    commentId: messageContent.commentId,
                                    type: 'comment',
                                    action: 'like'
                                });

                            } else if (messageContent.action === 'dislike') {
                                await this.commentLikeRepository.dislikeComment({
                                    commentId: messageContent.commentId,
                                    userId: messageContent.userId
                                });
                                let dislikeCount = await this.commentLikeRedisRepository.getCommentDislikeCount(messageContent.commentId);
                                if (dislikeCount) {
                                    await this.commentLikeRedisRepository.saveCommentDislikeCount({commentId: messageContent.commentId, dislikeCount: dislikeCount + 1});
                                    this.likeSocketService.emitNotificationToAll({event:'comment-dislike', data: {commentId: messageContent.commentId, dislikeCount: dislikeCount + 1}});
                                }
                                else {
                                    dislikeCount = await this.commentLikeRepository.getDislikeCount(messageContent.commentId);
                                    await this.commentLikeRedisRepository.saveCommentDislikeCount({commentId: messageContent.commentId, dislikeCount: dislikeCount});
                                    this.likeSocketService.emitNotificationToAll({event:'comment-dislike', data: {commentId: messageContent.commentId, dislikeCount: dislikeCount}});
                                }
                                if(commentLikeAndDislike?.isLiked) {
                                    let likeCount = await this.commentLikeRedisRepository.getCommentLikeCount(messageContent.commentId);
                                    if (likeCount) {
                                        await this.commentLikeRedisRepository.saveCommentLikeCount({commentId: messageContent.commentId, likeCount: likeCount - 1});
                                        this.likeSocketService.emitNotificationToAll({event:'comment-like', data: {commentId: messageContent.commentId, likeCount: likeCount - 1}});
                                    }
                                    else {
                                        likeCount = await this.commentLikeRepository.getLikeCount(messageContent.commentId);
                                        await this.commentLikeRedisRepository.saveCommentLikeCount({commentId: messageContent.commentId, likeCount: likeCount});
                                        this.likeSocketService.emitNotificationToAll({event:'comment-like', data: {commentId: messageContent.commentId, likeCount: likeCount}});
                                    }
                                }
                                await this.producer.sendToQueue('notification', {
                                    triggeredBy: messageContent.userId,
                                    postId: comment.postId,
                                    userId: comment.userId,
                                    commentId: messageContent.commentId,
                                    type: 'comment',
                                    action: 'dislike'
                                });
                            } else if (messageContent.action === 'remove-like') {
                                await this.commentLikeRepository.removeLike({
                                    commentId: messageContent.commentId,
                                    userId: messageContent.userId
                                });
                                let likeCount = await this.commentLikeRedisRepository.getCommentLikeCount(messageContent.commentId);
                                if (likeCount) {
                                    await this.commentLikeRedisRepository.saveCommentLikeCount({commentId: messageContent.commentId, likeCount: likeCount - 1});
                                    this.likeSocketService.emitNotificationToAll({event:'comment-like', data: {commentId: messageContent.commentId, likeCount: likeCount - 1}});
                                }
                                else {
                                    likeCount = await this.commentLikeRepository.getLikeCount(messageContent.commentId);
                                    await this.commentLikeRedisRepository.saveCommentLikeCount({commentId: messageContent.commentId, likeCount: likeCount});
                                    this.likeSocketService.emitNotificationToAll({event:'comment-like', data: {commentId: messageContent.commentId, likeCount: likeCount}});
                                }
                            } else if (messageContent.action === 'remove-dislike') {
                                await this.commentLikeRepository.removeDislike({
                                    commentId: messageContent.commentId,
                                    userId: messageContent.userId
                                });
                                let dislikeCount = await this.commentLikeRedisRepository.getCommentDislikeCount(messageContent.commentId);
                                if (dislikeCount) {
                                    await this.commentLikeRedisRepository.saveCommentDislikeCount({commentId: messageContent.commentId, dislikeCount: dislikeCount - 1});
                                    this.likeSocketService.emitNotificationToAll({event:'comment-dislike', data: {commentId: messageContent.commentId, dislikeCount: dislikeCount - 1}});
                                }
                                else {
                                    dislikeCount = await this.commentLikeRepository.getDislikeCount(messageContent.commentId);
                                    await this.commentLikeRedisRepository.saveCommentDislikeCount({commentId: messageContent.commentId, dislikeCount: dislikeCount});
                                    this.likeSocketService.emitNotificationToAll({event:'comment-dislike', data: {commentId: messageContent.commentId, dislikeCount: dislikeCount}});
                                }
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