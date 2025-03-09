const {Router} = require('express');
const otpController = require('../controllers/otp-controller');
const {otpCreateSchema, otpVerifySchema} = require('../utils/zod/otp-schema-zod');
const {bodyValidator} = require('../middlewares/validator-middleware');
const otpRouter = Router();


otpRouter.post('/create', bodyValidator(otpCreateSchema), otpController.createOTP);
otpRouter.post('/verify', bodyValidator(otpVerifySchema), otpController.verifyOTP);

module.exports = otpRouter;