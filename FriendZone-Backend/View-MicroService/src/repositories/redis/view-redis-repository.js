const RedisConnection = require('./redis-connection');

class ViewRedisRepository {
    static #redis = null;

    constructor() {
        if (!ViewRedisRepository.#redis) {
            ViewRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = ViewRedisRepository.#redis;
        this.redis.on('connect', () => {
            console.log('Redis connected');
        });
        this.redis.on('error', (error) => {
            console.log(error);
        });
    }

    getKey(id) {
        return `view-service:posts:${id}`;
    }

    async getPostViews({postId}) {
        try {
            const key = this.getKey(postId);
            const views = await this.redis.get(key);
            return views ? parseInt(views) : null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async setPostViews({postId, views}) {
        try {
            const key = this.getKey(postId);
            await this.redis.set(key, views);
            await this.redis.expire(key, 3600);
        } catch (error) {
            console.log(error);
        }
    }


    // async disconnect(){
    //     try {
    //         if(ViewRedisRepository.#redis){
    //             await ViewRedisRepository.#redis.disconnect();
    //             ViewRedisRepository.#redis = null;
    //         }
    //     }
    //     catch(error){
    //         console.log(error);
    //     }
    // }

}


// process.on('SIGINT', async () => {
//     const viewRedisRepository = new ViewRedisRepository();
//     await viewRedisRepository.disconnect();
//     console.log('Gracefully shutting down redis connection');
//     process.exit(0);
// });
//
// process.on('SIGTERM', async () => {
//     const viewRedisRepository = new ViewRedisRepository();
//     await viewRedisRepository.disconnect();
//     console.log('Gracefully shutting down redis connection');
//     process.exit(0);
// });
//
// process.on('exit', async () => {
//     const viewRedisRepository = new ViewRedisRepository();
//     await viewRedisRepository.disconnect();
//     console.log('Gracefully shutting down redis connection');
//     process.exit(0);
// });

module.exports = ViewRedisRepository;