const followerRouter = require('./follower-route');
const AppError = require('../utils/errors/app-error');

const routes = (app) => {
    app.use('/api/followers', followerRouter);
    app.get('/api/followers/health', (req, res) => {
        res.status(200).json({
            message: 'Welcome to Follower Microservice',
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

    })
}

module.exports = routes;