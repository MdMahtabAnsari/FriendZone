const Token = require('../models/token-model');
const NotFoundError = require('../utils/errors/not-found-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const AppError = require('../utils/errors/app-error');
const BadRequestError = require('../utils/errors/bad-request-error');

class TokenRepository {

    async getTokenByUserId(userId) {
        try {
            const token = await Token.findOne({userId: userId});
            if (!token) {
                throw new NotFoundError('Token');
            }
            return token;
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        }
    }

    async createToken({userId, token}) {
        try {
           const existingToken = await Token.findOne({userId: userId});
              if (existingToken) {
                existingToken.token = token;
                await existingToken?.save();
                return existingToken;
              }
                const newToken = new Token({userId, token});
                await newToken.save();
                return newToken;
        } catch (error) {
            console.log(error);
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((error) => error.message);
                throw new BadRequestError(errors);
            }
            else {
                throw new InternalServerError();
            }
        }
    }
}

module.exports = TokenRepository;
