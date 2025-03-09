const axiosInstance = require('./axios');
const {API_GATEWAY_URL} = require('../../configs/server-config');

class CommentApi {
    static api = null;

    constructor() {
        if (!CommentApi.api) {
            CommentApi.api = axiosInstance({baseURL: API_GATEWAY_URL});
        }
        this.api = CommentApi.api;
    }

    async isCommentExists({commentId}) {
        try {
            const response = await this.api.get(`/api/comments/get/exists/${commentId}`, {
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

    async getUserIdAndPostIdByCommentId({commentId}) {
        try {
            const response = await this.api.get(`/api/comments/get/user-post/${commentId}`, {
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

module.exports = CommentApi;