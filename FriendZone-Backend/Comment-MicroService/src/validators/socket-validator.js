const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../utils/errors/un-authorized-error');
const {AUTH_JWT_SECRET, AUTH_COOKIE_NAME} = require('../configs/server-config');
const cookie = require('cookie');

const socketValidator = (socket, next) => {
    try {
        const cookies = cookie.parse(socket.request.headers.cookie);
        const token = cookies[AUTH_COOKIE_NAME];
        if (!token) {
            console.log('Token not found');
            throw new UnauthorizedError('Unauthorized socket connection');
        }
        const decoded = jwt.verify(token, AUTH_JWT_SECRET);
        if (!decoded) {
            console.log('Invalid token');
            throw new UnauthorizedError('Unauthorized socket connection');
        }
        socket.userId = decoded._id;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {socketValidator};
