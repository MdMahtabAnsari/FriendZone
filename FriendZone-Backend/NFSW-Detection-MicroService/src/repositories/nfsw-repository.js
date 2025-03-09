const NFSW = require('../models/nfsw-model');
const InternalServerError = require('../utils/errors/internal-server-error');
const BadRequestError = require('../utils/errors/bad-request-error');

class NFSWRepository {
    async createNFSW(postId) {
        try {
            return await NFSW.create({postId: postId});
        } catch (error) {
            console.log(error);
            if(error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((value) => value.message);
                throw new BadRequestError(errors);
            }
            else {
                throw new InternalServerError();
            }
        }
    }

    async updateNFSW({postId, isNFSW}) {
        try {
            return await NFSW.findOneAndUpdate({postId: postId}, {isNFSW: isNFSW}, {new: true});
        } catch (error) {
            console.log(error);
           if(error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((value) => value.message);
                throw new BadRequestError(errors);
            }
           else if(error.name === 'CastError') {
                throw new BadRequestError('Invalid Post ID');
            }
            else {
                throw new InternalServerError();
            }
        }
    }

    async deleteNFSW(postId) {
        try {
            return await NFSW.findOneUpdate({postId: postId}, {isDeleted: true}, {new: true});
        } catch (error) {
            console.log(error);
            if (error.name === 'CastError') {
                throw new BadRequestError('Invalid Post ID');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getNFSWByPostId(postId) {
        try {
            return await NFSW.findOne({postId: postId});
        } catch (error) {
            console.log(error);

            throw new InternalServerError();
        }
    }
}

module.exports = NFSWRepository;