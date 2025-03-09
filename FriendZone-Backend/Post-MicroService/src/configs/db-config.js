const mongoose = require('mongoose');
const {DB_URL} = require('./server-config');

const connectToDB = async (retryCount = 0) => {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to MongoDB');

    } catch (error) {
        console.log('Error connecting to MongoDB: ', error);
        retryCount++;
        if (retryCount < 5) {
            setTimeout(async () => {
                await connectToDB(retryCount);
            }, 5000);
        } else {
            console.log('Connection to MongoDB failed');
        }
    }
}
module.exports = {connectToDB};
