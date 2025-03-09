import { CustomPostCard } from '../../components/index.js';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Box,Typography } from '@mui/material';
import {useFetchDislikesCount, useFetchLikesCount, useFetchPostsLikeAndDislikeStatus, useFetchViews } from '../../hooks/post/index.js';
import { useDispatch,useSelector } from 'react-redux';
import { likePost, dislikePost, removeDislike, removeLike, setLikeCount, setDislikeCount, setPostLikeAndDislikeStatus } from '../../store/slices/post/like.js';
import {deletePost,fetchPostById} from '../../store/slices/post/post.js'
import {useFetchUserById} from '../../hooks/user/index.js'
import { useFetchCommentsCount } from '../../hooks/comment/index.js';
import {useNavigate} from "react-router-dom";
import routesConfig from "../../routes/routes.js";
import {useParams} from "react-router-dom";
import frontendConfig from "../../configs/frontend-config.js";



const UserPost = () => {
   
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState({});
    const [dislikes, setDislikes] = useState({});
    const [comments, setComments] = useState({});
    const [likeAndDislike, setLikeAndDislike] = useState({});
    const [views, setViews] = useState({});
    const [user,setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user: storedLogInUser } = useSelector((state) => state.auth);
    const [logInUser, setLogInUser] = useState(null);
    const navigate = useNavigate();
    const fetchedPost = useRef(null);
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    
    const postsLikeCount = useFetchLikesCount();
    const postsDislikeCount = useFetchDislikesCount();
    const postsViewCount = useFetchViews();
    const postsLikeAndDislikeStatus = useFetchPostsLikeAndDislikeStatus();
    const postsCommentCount = useFetchCommentsCount();
    const fetchUserById = useFetchUserById();

    const getPosts = useCallback(async () => {
        if (loading ) return;
        setLoading(true);
        const response = await dispatch(fetchPostById(postId));
        if (response?.payload?.success) {
           
            const postData = response?.payload?.data;
            
            const likesResponse = await postsLikeCount([postId]);
            const dislikesResponse = await postsDislikeCount([postId]);
            const commentsResponse = await postsCommentCount([postId]);
            const viewsResponse = await postsViewCount([postId]);
            const likeAndDislikeResponse = await postsLikeAndDislikeStatus([postId]);
            const userResponse = await fetchUserById(postData?.userId);
            setPost(postData);
            setLikes((prev)=>({...prev,...likesResponse}));
            setDislikes((prev)=>({...prev,...dislikesResponse}));
            setComments((prev)=>({...prev,...commentsResponse}));
            setViews((prev)=>({...prev,...viewsResponse}));
            setLikeAndDislike((prev)=>({...prev,...likeAndDislikeResponse}));
            setUser(userResponse);
           
        }
        else{
            setError(response?.payload?.message);
        }
        fetchedPost.current = postId;
        setLoading(false);
    }, [dispatch, fetchUserById, loading, postId, postsCommentCount, postsDislikeCount, postsLikeAndDislikeStatus, postsLikeCount, postsViewCount]);
    // Like post
    const handleLikePost = useCallback(async (postId) => {
        if (likeAndDislike[postId]?.isLiked) return;
        const response = await dispatch(likePost(postId));
        if (response?.payload?.success) {
            dispatch(setLikeCount({ postId, likes: likes[postId] + 1 }));
            dispatch(setPostLikeAndDislikeStatus({ postId, isLiked: true, isDisliked: false }));
            setLikes((prev) => ({ ...prev, [postId]: likes[postId] + 1 }));
            setLikeAndDislike((prev) => ({ ...prev, [postId]: { postId, isLiked: true, isDisliked: false } }));
            if(likeAndDislike[postId]?.isDisliked) {
                dispatch(setDislikeCount({postId, dislikes: dislikes[postId] - 1}));
                setDislikes((prev) => ({...prev, [postId]: dislikes[postId] - 1}));
            }
        }
    }, [likeAndDislike, dispatch, likes, dislikes]);

    // Dislike post
    const handleDislikePost = useCallback(async (postId) => {
        if (likeAndDislike[postId]?.isDisliked) return;
        const response = await dispatch(dislikePost(postId));
        if (response?.payload?.success) {
            dispatch(setDislikeCount({ postId, dislikes: dislikes[postId] + 1 }));
            dispatch(setPostLikeAndDislikeStatus({ postId, isLiked: false, isDisliked: true }));
            setDislikes((prev) => ({ ...prev, [postId]: dislikes[postId] + 1 }));
            setLikeAndDislike((prev) => ({ ...prev, [postId]: { postId, isLiked: false, isDisliked: true } }));
            if(likeAndDislike[postId]?.isLiked) {
                dispatch(setLikeCount({postId, likes: likes[postId] - 1}));
                setLikes((prev) => ({...prev, [postId]: likes[postId] - 1}));
            }
        }
    }, [likeAndDislike, dispatch, dislikes, likes]);

    // Remove like
    const handleRemoveLike = useCallback(async (postId) => {
        if (!likeAndDislike[postId]?.isLiked) return;
        const response = await dispatch(removeLike(postId));
        if (response?.payload?.success) {
            dispatch(setLikeCount({ postId, likes: likes[postId] - 1 }));
            dispatch(setPostLikeAndDislikeStatus({ postId, isLiked: false, isDisliked: false }));
            setLikes((prev) => ({ ...prev, [postId]: likes[postId] - 1 }));
            setLikeAndDislike((prev) => ({ ...prev, [postId]: { postId, isLiked: false, isDisliked: false } }));
        }
    }, [likeAndDislike, dispatch, likes]);

    // Remove dislike
    const handleRemoveDislike = useCallback(async (postId) => {
        if (!likeAndDislike[postId]?.isDisliked) return;
        const response = await dispatch(removeDislike(postId));
        if (response?.payload?.success) {
            dispatch(setDislikeCount({ postId, dislikes: dislikes[postId] - 1 }));
            dispatch(setPostLikeAndDislikeStatus({ postId, isLiked: false, isDisliked: false }));
            setDislikes((prev) => ({ ...prev, [postId]: dislikes[postId] - 1 }));
            setLikeAndDislike((prev) => ({ ...prev, [postId]: { postId, isLiked: false, isDisliked: false } }));
        }
    }, [likeAndDislike, dispatch, dislikes]);

    const handleDeletePost = useCallback(async (postId) => {
        const response = await dispatch(deletePost(postId));
        if (response?.payload?.success) {
            navigate(routesConfig.home);
        }
    }, [dispatch, navigate]);

    const handleUpdatePost = useCallback(async (postId) => {
        navigate(routesConfig.updatePost.replace(':postId', postId));
    }, [navigate]);



    useEffect(() => {
        if(postId && fetchedPost.current !== postId) {
            getPosts();
        }
    }, [getPosts, postId]);

    useEffect(() => {
        if (storedLogInUser) {
            setLogInUser(storedLogInUser);
        }
    }, [storedLogInUser]);

    return (
        <>
            {logInUser && post && !loading && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={2}
                >
                    <CustomPostCard
                        post={post}
                        likes={likes[post._id || post.id]}
                        dislikes={dislikes[post._id || post.id]}
                        comments={comments[post._id || post.id]}
                        views={views[post._id || post.id]}
                        user={user}
                        onLike={handleLikePost}
                        onDislike={handleDislikePost}
                        onRemoveLike={handleRemoveLike}
                        onRemoveDislike={handleRemoveDislike}
                        onDelete={handleDeletePost}
                        onUpdate={handleUpdatePost}
                        likeAndDislikeStatus={likeAndDislike}
                        setComments={setComments}
                        shareUrl={`${frontendConfig.FRONTEND_URL}${routesConfig.post.replace(':postId', (post._id || post.id))}`}
                        isUserPost={logInUser._id === post.userId}
                        setDislikes={setDislikes}
                        setLikes={setLikes}
                        setViews={setViews}
                    />
                </Box>
            )}
            {error && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    marginTop='20px'

                >
                    <Typography variant="h6">{error}</Typography>
                </Box>
            )}
        </>
    );
};


export default UserPost;