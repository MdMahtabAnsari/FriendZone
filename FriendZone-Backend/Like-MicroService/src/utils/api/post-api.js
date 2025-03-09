const axiosInstance = require('./axios');
const {API_GATEWAY_URL} = require('../../configs/server-config');

class PostApi {
    static api = null;

    constructor() {
        if (!PostApi.api) {
            PostApi.api = axiosInstance({baseURL: API_GATEWAY_URL});
        }
        this.api = PostApi.api;
    }

    async isPostExists({postId}) {
        try {
            const response = await this.api.get(`/api/posts/get/exists/${postId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('response', response.data);
            return response?.data?.data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getUserIdByPostId({postId}) {
        try {
            const response = await this.api.get(`/api/posts/get/userId/${postId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('response', response.data);
            return response?.data?.data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

module.exports = PostApi;