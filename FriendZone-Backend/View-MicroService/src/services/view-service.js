const ViewRedisRepository = require('../repositories//redis/view-redis-repository');
const ViewRepository = require('../repositories/view-repository');
const Producer = require('../services/rabbitmq/producer');
const InternalServerError = require('../utils/errors/internal-server-error');

class ViewService {
    constructor() {
        this.viewRedisRepository = new ViewRedisRepository();
        this.viewRepository = new ViewRepository();
        this.producer = new Producer();
    }

    async getPostViews({postId}) {
        try {
            const cachedViews = await this.viewRedisRepository.getPostViews({postId});
            if (cachedViews) {
                return {
                    postId,
                    views: cachedViews
                }
            }
            const views = await this.viewRepository.getViewsCount(postId);
            await this.viewRedisRepository.setPostViews({postId, views});
            return {
                postId,
                views: views
            }
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async createViewPost({userId, postId}) {
        try {
            await this.producer.sendToQueue('view', {userId, postId});
            return true;

        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }
}

module.exports = ViewService;