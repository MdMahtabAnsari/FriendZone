const dotenv = require('dotenv');
dotenv.config();

const dataUnitConvertor = ({data, type}) => {
    const [value, unit] = data.split('-');
    if (unit === 'MB') {
        return parseInt(value) * 1024 * 1024;
    }
    if (unit === 'KB') {
        return parseInt(value) * 1024;
    }
    if (type === 'image') {
        return 10 * 1024 * 1024;
    }
    if (type === 'video') {
        return 50 * 1024 * 1024;
    }
    return 0;
}

module.exports = {
    //Port configuration
    PORT: process.env.PORT || 3000,
    //DB configuration
    DB_URL: process.env.DB_URL,

    //Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    //Redis configuration
    REDIS_SERVICE_URL: process.env.REDIS_SERVICE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_SECURE: process.env.REDIS_SECURE === 'true',
    //CORS configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN=== '*' ? '*' : process.env.CORS_ORIGIN?.split(','),
    CORS_METHODS: process.env.CORS_METHODS?.split(','),
    CORS_HEADERS: process.env.CORS_HEADERS?.split(','),
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
    //Multer configuration
    MULTER_ALLOWED_FILE_TYPES: process.env.MULTER_ALLOWED_FILE_TYPES?.split(','),
    MULTER_IMAGE_MAX_SIZE: dataUnitConvertor({data: process.env.MULTER_IMAGE_MAX_SIZE, type: 'image'}),
    MULTER_VIDEO_MAX_SIZE: dataUnitConvertor({data: process.env.MULTER_VIDEO_MAX_SIZE, type: 'video'}),
    //JWT configuration
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,

    //RabbitMQ configuration
    RABBITMQ_SERVICE_URL: process.env.RABBITMQ_SERVICE_URL,

    //Neo4j configuration
    NEO4J_URL: process.env.NEO4J_URL,
    NEO4J_USER: process.env.NEO4J_USER,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD

}