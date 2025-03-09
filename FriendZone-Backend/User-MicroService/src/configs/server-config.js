const dotenv = require('dotenv');
dotenv.config();

const Converter = (time, unit) => {
    if (unit === 'D') {
        return parseInt(time) * 24 * 60 * 60 * 1000;
    } else if (unit === 'H') {
        return parseInt(time) * 60 * 60 * 1000;
    } else if (unit === 'M') {
        return parseInt(time) * 60 * 1000;
    } else if (unit === 'S') {
        return parseInt(time) * 1000;
    } else if (unit === 'MS') {
        return parseInt(time);
    } else {
        throw new Error('Invalid time unit');
    }
}

const timeConversion = (cookieExpiresIn) => {
    try {
        const [time, unit] = cookieExpiresIn.split('-');
        return Converter(time, unit);
    } catch (error) {
        console.log(error);
        return 0;
    }

}

const multerFileSizeConverter = (fileSize) => {
    try {
        const [size, unit] = fileSize.split('-');
        if (unit === 'KB') {
            return parseInt(size) * 1024;
        } else if (unit === 'MB') {
            return parseInt(size) * 1024 * 1024;
        } else if (unit === 'GB') {
            return parseInt(size) * 1024 * 1024 * 1024;
        } else {
            throw new Error('Invalid file size unit');
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
}


const serverConfig = {
    // PORT Configuration
    PORT: process.env.PORT,
    // DB Configuration
    DB_URL: process.env.DB_URL,
    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN=== '*' ? '*' : process.env.CORS_ORIGIN?.split(','),
    CORS_METHODS: process.env.CORS_METHODS?.split(','),
    CORS_HEADERS: process.env.CORS_HEADERS?.split(','),
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
    // AUTH JWT Configuration
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
    AUTH_JWT_EXPIRES_IN: process.env.AUTH_JWT_EXPIRES_IN,
    // Refresh JWT Configuration
    REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
    REFRESH_JWT_EXPIRES_IN: process.env.REFRESH_JWT_EXPIRES_IN,
    // BCRYPT Configuration
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
    // Default Profile Picture
    DEFAULT_PROFILE_PICTURE: process.env.DEFAULT_PROFILE_PICTURE,
    //Auth Cookie Configuration
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    AUTH_COOKIE_EXPIRES_IN: timeConversion(process.env.AUTH_COOKIE_EXPIRES_IN),
    // Refresh Cookie Configuration
    REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME,
    REFRESH_COOKIE_EXPIRES_IN: timeConversion(process.env.REFRESH_COOKIE_EXPIRES_IN),
    // Cookie Configuration
    COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
    COOKIE_HTTP_ONLY: process.env.COOKIE_HTTP_ONLY === 'true',
    COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE,
    //multer configuration
    MULTER_MAX_FILE_SIZE: multerFileSizeConverter(process.env.MULTER_MAX_FILE_SIZE),
    MULTER_ALLOWED_FILE_TYPES: process.env.MULTER_ALLOWED_FILE_TYPES?.split(','),
    //OTP Configuration
    OTP_EXPIRES_IN: timeConversion(process.env.OTP_EXPIRES_IN),
    OTP_LENGTH: parseInt(process.env.OTP_LENGTH, 10),
    OTP_CHARSET: process.env.OTP_CHARSET,
    // OTP Cookie Configuration
    OTP_COOKIE_NAME: process.env.OTP_COOKIE_NAME,
    OTP_COOKIE_EXPIRES_IN: timeConversion(process.env.OTP_COOKIE_EXPIRES_IN),
    //OTP JWT Configuration
    OTP_JWT_SECRET: process.env.OTP_JWT_SECRET,
    OTP_JWT_EXPIRES_IN: process.env.OTP_JWT_EXPIRES_IN,
    //Redis Configuration
    REDIS_SERVICE_URL: process.env.REDIS_SERVICE_URL,
    REDIS_USER_EXPIRES_IN: timeConversion(process.env.REDIS_USER_EXPIRES_IN),
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_SECURE: process.env.REDIS_SECURE === 'true',
    //RabbitMQ Configuration
    RABBITMQ_SERVICE_URL: process.env.RABBITMQ_SERVICE_URL,
    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    //Neo4j Configuration
    NEO4J_URL: process.env.NEO4J_URL,
    NEO4J_USER: process.env.NEO4J_USER,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,


};

module.exports = serverConfig;