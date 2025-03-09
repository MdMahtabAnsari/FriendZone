const mongoose = require('mongoose');
const {DB_URL} = require('./server-config');


const connectToDB = async (retryCount = 0) => {
    try {
        await mongoose.connect(DB_URL);
        console.log('DB connected');
        return true;

    } catch (error) {
        console.log('DB connection error: ', error);
        retryCount++;
        if (retryCount < 5) {
            return await connectToDB(retryCount);
        } else {
            console.log('DB connection failed');
            return null;
        }
    }
}

module.exports = {
    connectToDB
}