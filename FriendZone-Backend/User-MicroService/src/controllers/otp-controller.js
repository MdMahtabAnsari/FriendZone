const OTPService = require('../services/otp-service');
const AppError = require('../utils/errors/app-error');
const serverConfig = require('../configs/server-config');
const otpService = new OTPService();

const createOTP = async (req, res) => {
    try {
        const otpDetail = {
            email: req.body?.email
        }
        const response = await otpService.createOTP(otpDetail);
        res.status(201).json({
            message: "OTP created successfully",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const verifyOTP = async (req, res) => {
    try {
        const email = req.body?.email;
        const otp = req.body?.otp;
        const response = await otpService.verifyOTP(email, otp);
        res.cookie(serverConfig?.OTP_COOKIE_NAME, response?.token, {
            httpOnly: serverConfig?.COOKIE_SECURE,
            secure: serverConfig?.COOKIE_SECURE,
            expires: new Date(Date.now() + serverConfig?.OTP_COOKIE_EXPIRES_IN),
            // sameSite: serverConfig?.COOKIE_SAME_SITE,
        }).status(200).json({
            message: "OTP verified successfully",
            success: true,
            data: true,
            error: {}
        })
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

module.exports = {
    createOTP,
    verifyOTP
}