const NotificationRepository = require('../repositories/notification-repository');
const AppError = require('../utils/errors/app-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const NotificationRedisRepository = require('../repositories/redis/notification-redis-repository');

class NotificationService {

    constructor() {
        this.notificationRepository = new NotificationRepository();
        this.notificationRedisRepository = new NotificationRedisRepository();
    }


    async getNotificationsByUserId({userId, page = 1, limit = 10}) {
        try {
            return await this.notificationRepository.getNotificationsByUserId({userId, page, limit});
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async markNotificationAsRead({notificationId, userId}) {
        try {
            const notification= await this.notificationRepository.markNotificationAsRead({notificationId, userId});
            const cachedCount = await this.notificationRedisRepository.getNotificationCount(userId);
            if(cachedCount){
                await this.notificationRedisRepository.saveNotificationCount({userId, count: cachedCount-1});
            }
            return notification;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }
    async getNotificationCountByUserId({userId}) {
        try{
            const cachedCount = await this.notificationRedisRepository.getNotificationCount(userId);
            if(cachedCount){
                return {
                    userId,
                    count: cachedCount
                }
            }
            const count = await this.notificationRepository.getNotificationCountByUserId({userId});
            await this.notificationRedisRepository.saveNotificationCount({userId, count});
            return {
                userId,
                count
            }
        }catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }
}

module.exports = NotificationService;