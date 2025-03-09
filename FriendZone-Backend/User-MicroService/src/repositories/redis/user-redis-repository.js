const serverConfig = require('../../configs/server-config');
const RedisConnection = require('./redis-connection');

class UserRedisRepository {
    static #redis = null;

    constructor() {
        if (!UserRedisRepository.#redis) {
            UserRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = UserRedisRepository.#redis;
        this.redis.on('connect', () => {
            console.log('Redis connected');
        });
        this.redis.on('error', (error) => {
            console.log('Redis connection error: ', error);
        });

    }

    getKey(id) {
        return `user-service:users:${id}`;
    }

    async saveUser(user) {
        try {
            // user is in form of object
            const idKey = this.getKey(user._id);
            const emailKey = this.getKey(user.email);
            await this.redis.set(idKey, JSON.stringify(user));
            await this.redis.set(emailKey, JSON.stringify(user));
            await this.redis.pexpire(idKey, serverConfig.REDIS_USER_EXPIRES_IN);
            await this.redis.pexpire(emailKey, serverConfig.REDIS_USER_EXPIRES_IN);
            return true;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getUser({id, email}, {password = false} = {}) {
        try {
            let key = null;
            if (id) {

                key = this.getKey(id);
            } else {
                key = this.getKey(email);
            }
            let user = null;
            if (typeof password === 'boolean' && password) {
                user = await this.redis.get(key);
                user = JSON.parse(user);
            } else {
                user = await this.redis.get(key);
                if (user) {
                    user = JSON.parse(user);
                    delete user.password;

                }
            }
            return user;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // async disconnect() {
    //     try{
    //         if(UserRedisRepository.#redis){
    //            await UserRedisRepository.#redis.disconnect();
    //             UserRedisRepository.#redis = null;
    //         }
    //
    //
    //     }
    //     catch(error) {
    //         console.log(error);
    //
    //     }
    // }

}

// process.on('SIGINT', async () => {
//     const userRedisRepository = new UserRedisRepository();
//     await userRedisRepository.disconnect();
//     console.log('Gracefully shutting down User redis connection');
//     process.exit(0);
// });
//
// process.on('SIGTERM', async () => {
//     const userRedisRepository = new UserRedisRepository();
//     await userRedisRepository.disconnect();
//     console.log('Gracefully shutting down user redis connection');
//     process.exit(0);
// });
//
// process.on('exit', async () => {
//     const userRedisRepository = new UserRedisRepository();
//     await userRedisRepository.disconnect();
//     console.log('Gracefully shutting down user redis connection');
//     process.exit(0);
// });


module.exports = UserRedisRepository;