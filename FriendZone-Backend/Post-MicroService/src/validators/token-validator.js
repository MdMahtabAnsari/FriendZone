const jwt = require('jsonwebtoken');
const {AUTH_JWT_SECRET, AUTH_COOKIE_NAME} = require('../configs/server-config');
const UnAuthorizedError = require('../utils/errors/un-authorized-error');
const AppError = require('../utils/errors/app-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const tokenValidator = (req, res, next) => {
    try {
        const token = req.cookies[AUTH_COOKIE_NAME];
        console.log(token);
        if (!token) {
            throw new UnAuthorizedError('Token not found');
        }
        const decoded = jwt.verify(token, AUTH_JWT_SECRET);
        if (!decoded) {
            throw new UnAuthorizedError('Invalid token');
        }
        req.user = decoded;
        next();
    } catch (err) {
        if (err instanceof AppError) {
            next(err);
        } else {
            console.log(err);
            next(new InternalServerError());
        }
    }
}

module.exports = {
    tokenValidator
}