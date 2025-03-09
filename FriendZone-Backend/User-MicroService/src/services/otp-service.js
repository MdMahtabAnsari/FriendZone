const OTPRepository = require('../repositories/otp-repository');
const randomizing = require('randomstring');
const serverConfig = require('../configs/server-config');
const AppError = require('../utils/errors/app-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const NotFoundError = require('../utils/errors/not-found-error');
const UnAuthorizedError = require('../utils/errors/un-authorized-error');
const jwt = require('jsonwebtoken');
const OtpRedisRepository = require('../repositories/redis/otp-redis-repository');
const Producer = require('../services/rabbitmq/producer');
const UserServices = require('./user-service');
const bcrypt = require('bcrypt');

class OTPService {
    constructor() {
        this.otpRepository = new OTPRepository();

        this.otpRedisRepository = new OtpRedisRepository();
        this.producer = new Producer();
        this.userService = new UserServices();
    }

    async createOTP(otpDetail) {
        try {
            const user = await this.userService.getUser({email: otpDetail.email});
            if (!user) {
                throw new NotFoundError('User');
            }
            otpDetail.otp = randomizing.generate({
                length: serverConfig?.OTP_LENGTH,
                charset: serverConfig?.OTP_CHARSET
            });
            const otpData = await this.otpRepository.createOTP(otpDetail);
            await this.otpRedisRepository.saveOTP({email: otpData.email, otp: otpData.otp});
            await this.producer.sendToQueue('email', {
                email: otpDetail.email,
                type: 'otp',
                data: {otp: otpDetail?.otp, expires: serverConfig?.OTP_EXPIRES_IN / (1000 * 60)}
            });
            return true;

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }

    async verifyOTP(email, otp) {
        try {
            let otpDetail = null;
            otpDetail = await this.otpRedisRepository.getOTP(email);
            if (!otpDetail) {
                otpDetail = await this.otpRepository.getOTPByEmail(email);
                if (otpDetail) {
                    await this.otpRedisRepository.saveOTP({email: otpDetail.email, otp: otpDetail.otp});
                }
            }
            if (!otpDetail) {
                throw new NotFoundError('OTP');
            }
            const isMatch = await bcrypt.compare(otp, otpDetail?.otp);
            if (!isMatch) {
                throw new UnAuthorizedError('Invalid OTP');
            }
            await this.otpRepository.deleteOTPByEmail(email);
            await this.otpRedisRepository.deleteOTP(email);
            const token = jwt.sign({email: email}, serverConfig?.OTP_JWT_SECRET, {expiresIn: serverConfig?.OTP_JWT_EXPIRES_IN});
            return {
                token: token,
            };

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            } else {
                console.log(error);
                throw new InternalServerError();
            }
        }
    }
}


module.exports = OTPService;