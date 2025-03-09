const axios = require('axios');

const axiosInstance = ({baseURL}) => {
    return axios.create({
        baseURL: baseURL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',

        },
    });
}

module.exports = axiosInstance;