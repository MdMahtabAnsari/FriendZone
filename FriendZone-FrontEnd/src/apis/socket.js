import {io} from 'socket.io-client';
import frontendConfig from "../configs/frontend-config.js";

const postSocket = io(frontendConfig.POST_SOCKET_URL, {
    path: frontendConfig.POST_HANDSHAKE_PATH,
    withCredentials: true,
    autoConnect: false,
    }
);

const userSocket = io(frontendConfig.USER_SOCKET_URL, {
    path: frontendConfig.USER_HANDSHAKE_PATH,
    withCredentials: true,
    autoConnect: false,
    });

const notificationSocket = io(frontendConfig.NOTIFICATION_SOCKET_URL, {
    path: frontendConfig.NOTIFICATION_HANDSHAKE_PATH,
    withCredentials: true,
    autoConnect: false,
    });

const likeSocket = io(frontendConfig.LIKE_SOCKET_URL, {
    path: frontendConfig.LIKE_HANDSHAKE_PATH,
    withCredentials: true,
    autoConnect: false,
    });

const commentSocket = io(frontendConfig.COMMENT_SOCKET_URL, {
    path: frontendConfig.COMMENT_HANDSHAKE_PATH,
    withCredentials: true,
    autoConnect: false,
    });

const viewSocket = io(frontendConfig.VIEWS_SOCKET_URL, {
    path: frontendConfig.VIEWS_HANDSHAKE_PATH,
    withCredentials: true,
    autoConnect: false,
    });

const followSocket = io(frontendConfig.FOLLOW_SOCKET_URL, {
    path: frontendConfig.FOLLOW_HANDSHAKE_PATH,
    withCredentials: true,
    autoConnect: false,
    });


export {
    postSocket,
    userSocket,
    notificationSocket,
    likeSocket,
    commentSocket,
    viewSocket,
    followSocket
}
