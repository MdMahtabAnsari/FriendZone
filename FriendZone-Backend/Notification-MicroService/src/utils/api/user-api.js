const axiosInstance = require('./axios');
const {API_GATEWAY_URL} = require('../../configs/server-config');

class UserApi {
    static api = null;

    constructor() {
        if (!UserApi.api) {
            UserApi.api = axiosInstance({baseURL: API_GATEWAY_URL});
        }
        this.api = UserApi.api;
    }

    async getUserById(userId) {
        try {
            const response = await this.api.get(`/api/users/user/get`, {
                params: {
                    _id: userId
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('response', response.data);
            return response?.data?.data;
        } catch (error) {
            console.log('Error getting user by id: ', error);
            return null;
        }
    }
}

module.exports = UserApi;