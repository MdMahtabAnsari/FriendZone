const postRouter = require('./post-router');
const multer = require('multer');
const AppError = require('../utils/errors/app-error');
const fs = require('fs');

const routes = (app) => {
    app.use('/api/posts', postRouter);
    app.get('/api/posts/health', (req, res) => {
        res.status(200).json({
            message: 'Welcome to Post Microservice',
        });
    });

    app.use((err, req, res, next) => {
        console.log(err);
        const {files} = req;
        if (files) {
            for (const file of files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
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
    })
}

module.exports = routes;