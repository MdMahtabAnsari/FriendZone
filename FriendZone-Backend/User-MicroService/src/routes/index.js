const userRouter = require('./user-router');
const authRouter = require('./auth-router');
const otpRouter = require('./otp-router');
const tokenRouter = require('./token-router');
const AppError = require('../utils/errors/app-error');
const multer = require('multer');

const routes = (app) => {
    app.use('/api/users/auth', authRouter);
    app.use('/api/users/user', userRouter);
    app.use('/api/users/otp', otpRouter);
    app.use('/api/users/token', tokenRouter);
    app.use('/api/users/health', (req, res) => {
        res.status(200).json({
            message: 'Welcome to User Microservice',
        });
    });
    app.use((err, req, res, next) => {
        console.log(err)
        if (err instanceof multer.MulterError) {
            res.status(400).json({
                message: err.message,
                success: false,
                data: {},
                error: "error",
            });
        } else if (err instanceof AppError) {
            res.status(err.statusCode).json({
                message: err.message,
                success: false,
                data: {},
                error: err.status,
            });
        } else {
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    });

}

module.exports = routes;