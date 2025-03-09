const View = require('../models/view-model');
const BadRequestError = require('../utils/errors/bad-request-error');
const NotFoundError = require('../utils/errors/not-found-error');
const InternalServerError = require('../utils/errors/internal-server-error');
const AppError = require('../utils/errors/app-error');

class ViewRepository {

    async createViewPost({userId, postId}) {
        try {
            let view = await View.findOne({userId: userId, postId: postId});
            if (view) {
                view.count += 1;
                await view?.save();
            } else {
                view = await View.create({userId: userId, postId: postId});
            }
            return view;

        } catch (error) {
            console.log(error); // log the error for debugging
            if (error.name === 'CastError') {
                throw new BadRequestError('Invalid User Id or Post Id');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getViewsCount(postId) {
        try {
            return await View.countDocuments({postId: postId});
        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError();
        }
    }
}

module.exports = ViewRepository;