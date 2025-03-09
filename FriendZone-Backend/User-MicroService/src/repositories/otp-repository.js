const OTP = require('../models/otp-model');
const InternalServerError = require('../utils/errors/internal-server-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const ConflictError = require('../utils/errors/conflict-error');


class OTPRepository {
    async createOTP(otpDetail) {
        try {
            const otp = new OTP(otpDetail);
            await otp.save();
            return {
                email: otp?.email,
                otp: otp?.otp
            };
        } catch (error) {
            console.log(error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((error) => error.message);
                throw new BadRequestError(errors);
            } else if (error.name === 'MongoServerError') {
                throw new ConflictError('Email');
            } else {
                throw new InternalServerError();
            }

        }
    }

    async getOTPByEmail(email) {
        try {
            return await OTP.findOne({email: email});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async deleteOTPByEmail(email) {
        try {
            return await OTP.deleteOne({email: email});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }
}

module.exports = OTPRepository;