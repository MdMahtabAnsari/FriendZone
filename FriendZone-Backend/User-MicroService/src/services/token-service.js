const TokenRepository = require('../repositories/token-repository');
const UserRepository = require('../repositories/user-repository');
const UnauthorizedError = require('../utils/errors/un-authorized-error');
const AppError = require('../utils/errors/app-error');
const NotFoundError = require('../utils/errors/not-found-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const jwt = require('jsonwebtoken');
const {REFRESH_JWT_SECRET,REFRESH_JWT_EXPIRES_IN,AUTH_JWT_SECRET,AUTH_JWT_EXPIRES_IN} = require('../configs/server-config');
const bcrypt = require('bcrypt');
class TokenService {
    constructor() {
        this.tokenRepository = new TokenRepository();
        this.userRepository = new UserRepository();
    }

    async getTokenByUserId(id) {
        try {
            return await this.tokenRepository.getTokenByUserId(id);
        } catch (error) {

            if (error instanceof AppError && error instanceof NotFoundError) {
                throw new UnauthorizedError('Refresh token is not valid');
            }
            else if(error instanceof AppError) {
                throw error;
            }
            else{
                console.log(error);
                throw new InternalServerError();
            }

        }
    }

    async createToken({id,email,token},{service=false}={}) {
        try {
           if(service){
              const refreshToken = jwt.sign({_id:id,email:email},REFRESH_JWT_SECRET,{expiresIn:REFRESH_JWT_EXPIRES_IN});
              const authTokens = jwt.sign({_id:id,email:email},AUTH_JWT_SECRET,{expiresIn:AUTH_JWT_EXPIRES_IN});
              await this.tokenRepository.createToken({userId:id,token:refreshToken});
              return {authTokens,refreshToken};
           }
           else{
               console.log('Token:',token);
               if(!token){
                     throw new UnauthorizedError('Refresh token is required');
               }
               const decoded = jwt.verify(token,REFRESH_JWT_SECRET);
               if(!decoded){
                   throw new UnauthorizedError('Refresh token is not valid');
               }
                const user = await this.userRepository.getUser({id:decoded._id,email:decoded.email});
                if(user.email.toString() !== decoded.email || user._id.toString() !== decoded._id){
                     throw new UnauthorizedError('Refresh token is not valid');
                }
                const storedToken = await this.tokenRepository.getTokenByUserId(decoded._id);
                const isMatch = await bcrypt.compare(token,storedToken.token);
                if(!isMatch){
                    throw new UnauthorizedError('Refresh token is not valid');
                }
               const refreshToken = jwt.sign({_id:user._id,email:user.email},REFRESH_JWT_SECRET,{expiresIn:REFRESH_JWT_EXPIRES_IN});
               const authTokens = jwt.sign({_id:user._id,email:user.email},AUTH_JWT_SECRET,{expiresIn:AUTH_JWT_EXPIRES_IN});
               await this.tokenRepository.createToken({userId:user._id,token:refreshToken});
               return {
                   token:{refreshToken,authTokens},
                   user:user
               }


           }
        } catch (error) {

            if (error instanceof AppError && error instanceof NotFoundError) {
                throw new UnauthorizedError('Refresh token is not valid');
            }
            else if(error instanceof AppError) {
                throw error;
            }
            else{
                console.log(error);
                throw new InternalServerError();
            }
        }
    }
}

module.exports = TokenService;