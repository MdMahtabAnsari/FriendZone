import axios from 'axios';
import frontendConfig  from "../configs/frontend-config.js";

const instance = axios.create({
    baseURL: frontendConfig.BACKEND_URL,
    withCredentials: true,
});

export default instance;