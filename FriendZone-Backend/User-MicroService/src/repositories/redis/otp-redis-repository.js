const serverConfig = require('../../configs/server-config');
const RedisConnection = require('./redis-connection');

class OTPRedisRepository {
    static #redis = null;

    constructor() {
        if (!OTPRedisRepository.#redis) {
            OTPRedisRepository.#redis = new RedisConnection().getRedis();
        }
        this.redis = OTPRedisRepository.#redis;
        this.redis.on('connect', () => {
            console.log('Redis connected');
        });
        this.redis.on('error', (error) => {
            console.log('Redis connection error: ', error);
        });
    }

    getKey(id) {
        return `user-service:otp:${id}`;
    }

    async saveOTP({email, otp}) {
        try {
            const key = this.getKey(email);
            await this.redis.set(key, JSON.stringify({email, otp}));
            console.log('serverConfig.OTP_EXPIRES_IN', serverConfig.OTP_EXPIRES_IN);
            await this.redis.pexpire(key, serverConfig.OTP_EXPIRES_IN);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getOTP(email) {
        try {
            const key = this.getKey(email);
            const otpDetail = await this.redis.get(key);
            if (otpDetail) {
                return JSON.parse(otpDetail);
            }
            return null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteOTP(email) {
        try {
            const key = this.getKey(email);
            await this.redis.del(key);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // async disconnect() {
    //     try{
    //         if(OTPRedisRepository.#redis){
    //             await OTPRedisRepository.#redis.disconnect();
    //             OTPRedisRepository.#redis = null;
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
//     const otpRedisRepository = new OTPRedisRepository();
//     await otpRedisRepository.disconnect();
//     console.log('Gracefully shutting down OTP redis connection');
//     process.exit(0);
// });
//
// process.on('SIGTERM', async () => {
//     const otpRedisRepository = new OTPRedisRepository();
//     await otpRedisRepository.disconnect();
//     console.log('Gracefully shutting down OTP redis connection');
//     process.exit(0);
// });
//
// process.on('exit', async () => {
//     const otpRedisRepository = new OTPRedisRepository();
//     await otpRedisRepository.disconnect();
//     console.log('Gracefully shutting down OTP redis connection');
//     process.exit(0);
// });

module.exports = OTPRedisRepository;