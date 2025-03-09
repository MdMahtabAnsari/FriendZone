const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {BCRYPT_SALT_ROUNDS,REFRESH_COOKIE_EXPIRES_IN}=require('../configs/server-config');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required'],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User Id is required'],
        ref: 'User',
        unique: [true, 'User can have only one token']
    },

});

tokenSchema.pre('save', async function (next) {
   try {
       if (this.isModified('token')) {
           this.token = await bcrypt.hash(this.token, BCRYPT_SALT_ROUNDS);
       }
       next();
   }
    catch (error) {
         next(error);
    }
});

tokenSchema.index({"createdAt": 1}, {expireAfterSeconds: REFRESH_COOKIE_EXPIRES_IN / 1000});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
