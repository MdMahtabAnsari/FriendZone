import { ThemeProvider, CssBaseline } from '@mui/material';
import useTheme from './hooks/useTheme.js';
import { Navbar } from "./components/index.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage,SignupPage,DashboardPage,CreatePost,NotificationPage,UpdatePostPage,UpdateProfilePage,ProfilePage,FollowerSuggestions,SearchPage,ForgotPasswordPage,UserPostPage } from "./pages/index.js";
import {userSocket,followSocket,notificationSocket,commentSocket,viewSocket,likeSocket,postSocket} from './apis/socket.js'
import routesConfig from "./routes/routes.js";
import {refreshToken} from "./store/slices/auth/auth-slice.js";
import {useDispatch,useSelector} from 'react-redux';
import {useEffect} from "react";
import {incrementUnreadNotificationCount,setNotifications} from './store/slices/notification/notification.js'
import {setDislikeCount,setLikeCount} from './store/slices/post/like.js'
import {setCommentLikeCount,setCommentDislikeCount} from './store/slices/comment/like.js'
import {setCommentCount} from './store/slices/comment/comment.js'
import {setFollowings} from './store/slices/follower/follower.js'
import {updateUserPost} from './store/slices/post/post.js'
import {setUser} from './store/slices/auth/auth-slice.js'
import {setUsers} from './store/slices/user/user.js'
import {setViewCount} from "./store/slices/post/view.js";

function App() {
    const theme = useTheme();
    const {user} = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    useEffect(() => {
        // Call refreshToken immediately on mount
        dispatch(refreshToken());

        // Set interval to call refreshToken every 10 minutes
        const interval = setInterval(() => {
            dispatch(refreshToken());
        }, 1000 * 60 * 10); // 10 minutes

        // Clear interval on component unmount
        return () => clearInterval(interval);
    }, [dispatch]);

   useEffect(() => {
       if(user?._id){
           userSocket.connect();
           followSocket.connect();
           notificationSocket.connect();
           commentSocket.connect();
           viewSocket.connect();
           likeSocket.connect();
           postSocket.connect();

            notificationSocket.on('notification', (data) => {
                dispatch(setNotifications(data));
                dispatch(incrementUnreadNotificationCount());
            });

            likeSocket.on('post-like', (data) => {
                dispatch(setLikeCount({postId:data.postId,likes:data.likeCount}));
            });
            likeSocket.on('post-dislike', (data) => {
                dispatch(setDislikeCount({postId:data.postId,dislikes:data.dislikeCount}));
            });
            likeSocket.on('comment-like', (data) => {
                dispatch(setCommentLikeCount({commentId:data.commentId,likes:data.likeCount}));
            });
            likeSocket.on('comment-dislike', (data) => {
                dispatch(setCommentDislikeCount({commentId:data.commentId,dislikes:data.dislikeCount}));
            });
            commentSocket.on('comment-count', (data) => {
                dispatch(setCommentCount({postId:data.postId,count:data.count}));
            });

            followSocket.on('follower', (data) => {
                dispatch(setFollowings(data));
            });

            postSocket.on('post', (data) => {
                dispatch(updateUserPost(data));
            });

            userSocket.on('image-updated', (data) => {
                console.log(data);
                dispatch(setUser(data));
                dispatch(setUsers(data));
            });

            viewSocket.on('view', (data) => {
                dispatch(setViewCount({postId:data.postId,views:data.views}));
            });
       }
         return () => {
              userSocket.disconnect();
              followSocket.disconnect();
              notificationSocket.disconnect();
              commentSocket.disconnect();
              viewSocket.disconnect();
              likeSocket.disconnect();
              postSocket.disconnect();
         }
   }, [dispatch, user]);


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Apply global background and text colors */}
            <Router>
                <Navbar />
                <Routes>
                    <Route path={routesConfig.home} element={<DashboardPage />} />
                    <Route path={routesConfig.login} element={<LoginPage />} />
                    <Route path={routesConfig.signup}  element={<SignupPage />} />
                    <Route path={routesConfig.create} element={<CreatePost />} />
                    <Route path={routesConfig.notifications} element={<NotificationPage />} />
                    <Route path={routesConfig.updatePost} element={<UpdatePostPage />} />
                    <Route path={routesConfig.updateProfile} element={<UpdateProfilePage />} />
                    <Route path={routesConfig.profile} element={<ProfilePage />} />
                    <Route path={routesConfig.followerSuggestions} element={<FollowerSuggestions />} />
                    <Route path={routesConfig.search} element={<SearchPage />} />
                    <Route path={routesConfig.forgotPassword} element={<ForgotPasswordPage />} />
                    <Route path={routesConfig.post} element={<UserPostPage />} />
                    <Route path="*" element={ <h1>Not Found</h1> } />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
