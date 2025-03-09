const {OTP_LENGTH} = require('../../configs/server-config');

const {z} = require('zod');

const otpCreateSchema = z.object({
    email: z.string().trim().email({message: 'Invalid email address'}),
});
const otpVerifySchema = z.object({
    otp: z.string().trim().length(OTP_LENGTH, {message: `OTP must be ${OTP_LENGTH} characters long`})
});


module.exports = {
    otpCreateSchema,
    otpVerifySchema
}