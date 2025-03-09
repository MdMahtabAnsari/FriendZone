const BadRequestError = require('../utils/errors/bad-request-error');

const bodyValidator = (schema) => (req, res, next) => {
    try {

        schema.parse(req.body);
        next();
    } catch (error) {
        const errors = Object.values(error.errors).map((error) => error.message);
        next(new BadRequestError(errors));
    }

}
const paramValidator = (schema) => async (req, res, next) => {
    try {

        await schema.parseAsync(req.params);
        next();
    } catch (error) {
        const errors = Object.values(error.errors).map((error) => error.message);
        next(new BadRequestError(errors));
    }
}

const queryValidator = (schema) => async (req, res, next) => {
    try {

        await schema.parseAsync(req.query);
        next();
    } catch (error) {
        const errors = Object.values(error.errors).map((error) => error.message);
        next(new BadRequestError(errors));
    }
}

module.exports = {
    bodyValidator,
    paramValidator,
    queryValidator
};