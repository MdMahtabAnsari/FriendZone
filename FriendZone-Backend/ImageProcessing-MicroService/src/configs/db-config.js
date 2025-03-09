const mongoose = require('mongoose');
const {DB_URL} = require('./server-config');

const connectToDB = async (retryCount = 0) => {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to DB');
    } catch (error) {
        if (retryCount > 5) {
            console.log('DB Connection failed');
            process.exit(1);
        }
        console.log('DB Connection failed, Retrying in 5 seconds');
        setTimeout(() => {
            connectToDB(retryCount + 1);
        }, 5000);
    }
}

module.exports = {connectToDB};