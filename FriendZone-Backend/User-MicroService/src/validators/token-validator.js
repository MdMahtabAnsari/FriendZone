const jwt = require('jsonwebtoken');
const {AUTH_COOKIE_NAME, AUTH_JWT_SECRET, OTP_JWT_SECRET, OTP_COOKIE_NAME} = require('../configs/server-config');
const UnauthorizedError = require('../utils/errors/un-authorized-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const AppError = require('../utils/errors/app-error');


const tokenValidator = (req, res, next) => {
    try {
        const token = {
            authToken: req.cookies[AUTH_COOKIE_NAME],
            otpToken: req.cookies[OTP_COOKIE_NAME],
        }

        if (!token.authToken && !token.otpToken) {
            throw new UnauthorizedError('Invalid Token');
        }
        if (token.authToken) {
            const decoded = jwt.verify(token.authToken, AUTH_JWT_SECRET);
            if (!decoded) {
                throw new UnauthorizedError('Invalid Token');
            }
            req.user = decoded;
            next();
        } else {
            const decoded = jwt.verify(token.otpToken, OTP_JWT_SECRET);
            if (!decoded) {
                throw new UnauthorizedError('Invalid Token');
            }
            req.user = decoded;
            next();
        }
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            console.log(error);
            next(new InternalServerError());
        }
    }
}


module.exports = {
    tokenValidator
}