const User = require('../models/user-model');
const InternalServerError = require('../utils/errors/internal-server-error');
const BadRequestError = require('../utils/errors/bad-request-error');
const ConflictError = require('../utils/errors/conflict-error');
const NotFoundError = require('../utils/errors/not-found-error');
const AppError = require('../utils/errors/app-error');

class UserRepository {
    async createUser(userDetail) {
        try {
            const user = new User(userDetail);
            await user.save();
           const userWithoutPassword = user.toObject();
           delete userWithoutPassword.password;
           return userWithoutPassword;

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

    async getUserByEmail(email) {
        try {
            return await User.findOne({email: email});
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUserById(id) {
        try {
            return await User.findById(id);
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUser({id, email}, {password = false} = {}) {
        try {
            console.log(id, email);
            let user = null;
            if (id) {
                if (typeof password === 'boolean' && password) {
                    user = await this.getUserById(id);
                    console.log(user);
                } else {
                    user = await User.findById(id).select('-password');
                }
            } else {
                if (typeof password === 'boolean' && password) {
                    user = await this.getUserByEmail(email);
                } else {
                    user = await User.findOne({email: email}).select('-password');
                }
            }

            if (!user) {
                throw new NotFoundError('User');
            }
            return user;
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        }
    }


    async updateUser({_id, email, name, dateOfBirth, gender, image, password,bio}, {password: includePassword = false}) {
        try {
            let user = null;
            if (!password) {
                if (!_id) {
                    user = await User.findOneAndUpdate({email: email}, {
                        email: email,
                        name: name,
                        dateOfBirth: dateOfBirth,
                        gender: gender,
                        image: image,
                        bio:bio
                    }, {new: true});
                } else {
                    user = await User.findByIdAndUpdate(_id, {
                        email: email,
                        name: name,
                        dateOfBirth: dateOfBirth,
                        gender: gender,
                        image: image,
                        bio:bio
                    }, {new: true});
                }
            } else {
                if (_id) {
                    console.log(_id);
                    user = await User.findById(_id);
                } else {

                    user = await User.findOne({email: email});

                }
                if (!user) {
                    throw new NotFoundError('User');
                }
                user.email = email ?? user?.email;
                user.name = name ?? user?.name;
                user.dateOfBirth = dateOfBirth ?? user?.dateOfBirth;
                user.gender = gender ?? user?.gender;
                user.image = image ?? user?.image;
                user.bio=bio??user?.bio;
                user.password = password;
                await user?.save();
            }
            if (!user) {
                throw new NotFoundError('User');
            }
            if (!includePassword) {
                return await this.getUser({id: _id, email: email});
            }

            return user;

        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((error) => error.message);
                throw new BadRequestError(errors);
            } else if (error.name === 'MongoError') {
                throw new ConflictError('Email');
            } else {
                throw new InternalServerError();
            }
        }
    }


    async getFilteredUsers(userIdList) {
        try {
            return await User.find({_id: {$in: userIdList}}).select('-password');
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getUserByName({name,page=1,limit=10}){
        try{
            return await User.find({name:{$regex:name,$options:'i'}}).skip((page-1)*limit).limit(limit).select('-password');
        }catch(error){
            console.log(error);
            throw new InternalServerError();
        }
    }




}

module.exports = UserRepository;