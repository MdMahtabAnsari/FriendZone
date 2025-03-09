const multer = require('multer');
const fs = require('fs');
const path = require('path');
const BadRequestError = require('../utils/errors/bad-request-error');
const serverConfig = require('./server-config');

const currentDir = process.cwd();
const uploadDir = path.join(currentDir, 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (serverConfig?.MULTER_ALLOWED_FILE_TYPES?.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new BadRequestError(`Invalid file type. Only ${serverConfig?.MULTER_ALLOWED_FILE_TYPES.join(',')} files are allowed`), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: serverConfig?.MULTER_MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});

module.exports = upload;

