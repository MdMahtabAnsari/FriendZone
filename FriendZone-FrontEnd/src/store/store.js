import {configureStore} from '@reduxjs/toolkit';
import themeReducer from './slices/theme-slice.js';
import authReducer from './slices/auth/auth-slice.js';
import postReducer from './slices/post/post.js';
import postLikeReducer from './slices/post/like.js';
import commentReducer from './slices/comment/comment.js';
import userReducer from './slices/user/user.js';
import postViewReducer from './slices/post/view.js';
import commentLikeReducer from './slices/comment/like.js';
import notificationReducer from "./slices/notification/notification.js";
import followerReducer from "./slices/follower/follower.js";

const store = configureStore({
    reducer: {
        theme: themeReducer,
        auth: authReducer,
        posts: postReducer,
        postLikes: postLikeReducer,
        comments: commentReducer,
        users: userReducer,
        postViews: postViewReducer,
        commentLikes: commentLikeReducer,
        notifications: notificationReducer,
        followers: followerReducer

    }
});

export default store;