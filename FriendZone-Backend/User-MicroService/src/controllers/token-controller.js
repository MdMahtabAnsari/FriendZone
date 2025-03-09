const TokenService = require('../services/token-service');
const AppError = require('../utils/errors/app-error');
const serverConfig = require('../configs/server-config');

const tokenService = new TokenService();


const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies[serverConfig?.REFRESH_COOKIE_NAME];
        const response = await tokenService.createToken({token: refreshToken}, {service: false});

        res.cookie(serverConfig?.AUTH_COOKIE_NAME, response?.token?.authTokens, {
            httpOnly: serverConfig?.COOKIE_SECURE,
            secure: serverConfig?.COOKIE_SECURE,
            expires: new Date(Date.now() + serverConfig?.AUTH_COOKIE_EXPIRES_IN),
            // sameSite: serverConfig?.COOKIE_SAME_SITE,
        }).cookie(serverConfig?.REFRESH_COOKIE_NAME, response?.token?.refreshToken, {
            httpOnly: serverConfig?.COOKIE_SECURE,
            secure: serverConfig?.COOKIE_SECURE,
            expires: new Date(Date.now() + serverConfig?.REFRESH_COOKIE_EXPIRES_IN),
            // sameSite: serverConfig?.COOKIE_SAME_SITE,
        }).status(200).json({
            message: "Token created successfully",
            success: true,
            data: response.user,
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

module.exports = {
    refreshToken
}