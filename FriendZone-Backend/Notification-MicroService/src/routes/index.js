const notificationRouter = require('./notification-router');
const AppError = require('../utils/errors/app-error');

const routes = (app) => {
    app.use('/api/notifications', notificationRouter);
    app.get('/api/notifications/health', (req, res) => {
        res.status(200).json({
            message: 'Welcome to Notification Microservice',

        });

    });
    app.use((error, req, res, next) => {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
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