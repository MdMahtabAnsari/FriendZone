const UserRepository = require('../repositories/user-repository');
const bcrypt = require('bcrypt');
const AppError = require('../utils/errors/app-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const NotFoundError = require('../utils/errors/not-found-error');
const UnAuthorizedError = require('../utils/errors/un-authorized-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const fs = require('fs');
const moment = require('moment-timezone');
const UserRedisRepository = require('../repositories/redis/user-redis-repository');
const ImageQueueService = require('./queue/image-queue-service');
const Producer = require('../services/rabbitmq/producer')
const GraphQueueService = require('./queue/graph-queue-service');
const TokenService = require('./token-service');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
        this.userRedisRepository = new UserRedisRepository();
        this.imageQueueService = new ImageQueueService();

        this.producer = new Producer();
        this.graphQueueService = new GraphQueueService();
        this.tokenService = new TokenService();
    }

    isValidDateOfBirth({dateOfBirth, timeZone}) {
        try {
            console.log(dateOfBirth, timeZone);
            if (!dateOfBirth) {
                throw new BadRequestError('Date of birth is required');
            }
            if (!timeZone) {
                throw new BadRequestError('Time zone is required');
            }
            const isValidFormat = moment(dateOfBirth, 'DD/MM/YYYY', true).isValid();
            if (!isValidFormat) {
                throw new BadRequestError('Invalid date of birth format');
            }
            const isValidDOB = moment.tz(dateOfBirth, 'DD/MM/YYYY', timeZone);
            if (isValidDOB.isAfter(moment.tz(timeZone))) {
                throw new BadRequestError('Date of birth should be less than current date');
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.log(error);
            throw new InternalServerError();
        }
    }

    async logIn(email, password) {
        try {
            let user = null;
            user = await this.userRedisRepository.getUser({email}, {password: true});
            if (!user) {
                user = await this.userRepository.getUser({email}, {password: true});
                if (user) {
                    await this.userRedisRepository.saveUser(user);
                }
            }
            if (!user) {
                throw new NotFoundError('User not found');
            }
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                throw new UnAuthorizedError('Invalid password');
            }

            const token = await this.tokenService.createToken({id: user._id, email: user.email}, {service: true});
            let userDetailsWithoutPassword = null;
            if (typeof user.toObject === 'function') {
                userDetailsWithoutPassword = user.toObject();
            } else {
                userDetailsWithoutPassword = user;
            }
            delete userDetailsWithoutPassword.password;
            return {
                token: token,
                user: userDetailsWithoutPassword

            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.log(error);
            throw new InternalServerError();
        }
    }

    async signUp({name, email, password, dateOfBirth, image, gender,bio ,timeZone}) {
        try {
            this.isValidDateOfBirth({dateOfBirth: dateOfBirth, timeZone: timeZone});


            const newUser = await this.userRepository.createUser({
                name: name,
                email: email,
                password: password,
                dateOfBirth: dateOfBirth,
                gender: gender,
                bio:bio
            });
            await this.producer.sendToQueue('email', {email: email, type: 'Welcome'});
            if (image) {
                await this.imageQueueService.imageUploadEvent({
                    id: newUser?._id,
                    imagePath: image,
                    timeZone: timeZone,
                    action: 'create'
                });
            } else {
                await this.graphQueueService.graphUploadEvent({
                    id: newUser?._id,
                    name: newUser?.name,
                    email: newUser?.email,
                    dateOfBirth: newUser?.dateOfBirth,
                    gender: newUser?.gender,
                    image: newUser?.image,
                    bio:newUser?.bio,
                    createdAt: newUser?.createdAt,
                    timeZone: timeZone,
                    action: 'create'
                });


            }
            return newUser;
        } catch (error) {
            if (fs.existsSync(image)) {
                fs.unlinkSync(image);
            }
            if (error instanceof AppError) {
                throw error;
            }
            console.log(error);
            throw new InternalServerError();
        }
    }

    async updateUser({_id, name, email, dateOfBirth, image, gender, password,bio ,timeZone}) {
        try {
            if (dateOfBirth) {
                this.isValidDateOfBirth({dateOfBirth: dateOfBirth, timeZone: timeZone});
            }
            const user = await this.userRepository.updateUser({
                _id: _id,
                name: name,
                email: email,
                dateOfBirth: dateOfBirth,
                gender: gender,
                password: password,
                bio:bio
            }, {password: true});

            if (image) {
                await this.imageQueueService.imageUploadEvent({
                    id: _id,
                    imagePath: image,
                    timeZone: timeZone?timeZone:null,
                    action: 'update'
                });
            } else {
                await this.userRedisRepository.saveUser(user);
                await this.graphQueueService.graphUploadEvent({
                    id: user?._id,
                    name: user?.name,
                    email: user?.email,
                    dateOfBirth: user?.dateOfBirth,
                    gender: user?.gender,
                    image: user?.image,
                    timeZone: timeZone? timeZone : null,
                    createdAt: user?.createdAt,
                    action: 'update'
                });
            }

            const userDetailsWithoutPassword = user?.toObject();
            delete userDetailsWithoutPassword.password;
            return userDetailsWithoutPassword;
        } catch (error) {
            if (fs.existsSync(image)) {
                fs.unlinkSync(image);
            }
            if (error instanceof AppError) {
                throw error;
            }
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUser({id, email}) {

        try {
            let user = null;
            user = await this.userRedisRepository.getUser({id, email});
            if (!user) {
                user = await this.userRepository.getUser({id, email}, {password: true});
                if (user) {
                    await this.userRedisRepository.saveUser(user);
                }

            }
            if (!user) {
                throw new NotFoundError('User not found');
            }
            if (user?.password) {
                delete user.password;
            }
            return user;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getFilteredUsers(userIdList) {
        try {
            if (!Array.isArray(userIdList) || userIdList.length === 0) {
                throw new BadRequestError('Invalid user list');
            }
            return await this.userRepository.getFilteredUsers(userIdList);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUserByName({name,page,limit}){
        try{
            if(!name){
                throw new BadRequestError('Name is required');
            }
            return await this.userRepository.getUserByName({name,page,limit});
        }catch(error){
            if(error instanceof AppError){
                throw error;
            }
            console.log(error);
            throw new InternalServerError();
        }
    }

}

module.exports = UserService;