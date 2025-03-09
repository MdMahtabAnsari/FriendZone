const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const serverConfig = require('../configs/server-config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        lowercase: true,
        trim: true,
        validator: {
            validator: function (value) {
                return emailValidator.validate(value);
            },
            message: props => `${props.value} is not a valid email address`
        }
    },
    dateOfBirth: {
        type: String,
        required: [true, 'Date of birth is required'],
        trim: true,
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ["Male", "Female", "Other"]
    },
    image: {
        type: String,
        default: serverConfig.DEFAULT_PROFILE_PICTURE
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: `Password must contain at least one uppercase letter, one lowercase letter, one number and one special character`
        }
    },
    bio:{
        type: String,
        trim: true,
        default: "",
        maxlength: [150, 'Bio must be less than 150 characters']

    }
}, {timestamps: true});

userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {

            this.password = await bcrypt.hash(this.password, serverConfig.BCRYPT_SALT_ROUNDS);
        }
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;