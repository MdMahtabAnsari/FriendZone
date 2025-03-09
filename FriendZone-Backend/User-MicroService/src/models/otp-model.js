const mongoose = require('mongoose');
const serverConfig = require('../configs/server-config');
const bcrypt = require('bcrypt');
const emailValidator = require('email-validator');


const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        unique: [true, 'Email already exists'],
        validator: {
            validator: function (value) {
                return emailValidator.validate(value);
            },
            message: props => `${props.value} is not a valid email address`
        }
    },
    otp: {
        type: String,
        required: [true, 'OTP is required']
    },

}, {timestamps: true});


otpSchema.pre('save', async function (next) {
        try {
            if (this.isModified('otp')) {
                this.otp = await bcrypt.hash(this.otp, serverConfig?.BCRYPT_SALT_ROUNDS);
            }
            next();
        } catch (err) {
            next(err);
        }
    }
);

otpSchema.index({"createdAt": 1}, {expireAfterSeconds: serverConfig?.OTP_EXPIRES_IN / 1000});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;


