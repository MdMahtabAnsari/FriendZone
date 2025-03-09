import { CustomPostCard, CustomSkeleton } from './index.js';
import { useEffect, useState, useRef, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, Typography } from '@mui/material';
import { useFetchUserPosts, useFetchDislikesCount, useFetchLikesCount, useFetchPostsLikeAndDislikeStatus, useFetchViews } from '../hooks/post/index.js';
import { useDispatch } from 'react-redux';
import { likePost, dislikePost, removeDislike, removeLike, setLikeCount, setDislikeCount, setPostLikeAndDislikeStatus } from '../store/slices/post/like.js';
import {deletePost} from '../store/slices/post/post.js'
import { useFetchCommentsCount } from '../hooks/comment/index.js';
import {useNavigate} from "react-router-dom";
import routesConfig from "../routes/routes.js";
import PropTypes from 'prop-types';
import frontendConfig from "../configs/frontend-config.js";

const UserPost = ({ userDetail,isUserPost=false }) => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // Removed setLimit as it is not used
    const [posts, setPosts] = useState({});
    const [likes, setLikes] = useState({});
    const [dislikes, setDislikes] = useState({});
    const [comments, setComments] = useState({});
    const [likeAndDislike, setLikeAndDislike] = useState({});
    const [views, setViews] = useState({});
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const fetchedPages = useRef(new Set());
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const fetchUserPosts = useFetchUserPosts(page, limit, setHasMore, posts, userDetail?._id || userDetail?.id);
    const postsLikeCount = useFetchLikesCount();
    const postsDislikeCount = useFetchDislikesCount();
    const postsViewCount = useFetchViews();
    const postsLikeAndDislikeStatus = useFetchPostsLikeAndDislikeStatus();
    const postsCommentCount = useFetchCommentsCount();

    const getPosts = useCallback(async () => {
        if (loading || fetchedPages.current.has(page)) return;
        setLoading(true);
        const response = await fetchUserPosts();
        if (response) {
            const keys = Object.keys(response);
            if (keys.length === 0) {
                setHasMore(false);
                setLoading(false);
                fetchedPages.current.add(page);
                return;
            }
            const unSavedLikes = keys.filter(key => !likes[key]);
            const unSavedDislikes = keys.filter(key => !dislikes[key]);
            const unSavedComments = keys.filter(key => !comments[key]);
            const unSavedViews = keys.filter(key => !views[key]);
            const unSavedLikeAndDislike = keys.filter(key => !likeAndDislike[key]);
            const likesResponse = await postsLikeCount(unSavedLikes);
            const dislikesResponse = await postsDislikeCount(unSavedDislikes);
            const commentsResponse = await postsCommentCount(unSavedComments);
            const viewsResponse = await postsViewCount(unSavedViews);
            const likeAndDislikeResponse = await postsLikeAndDislikeStatus(unSavedLikeAndDislike);
            setPosts(prev => ({ ...prev, ...response }));
            setLikes(prev => ({ ...prev, ...likesResponse }));
            setDislikes(prev => ({ ...prev, ...dislikesResponse }));
            setComments(prev => ({ ...prev, ...commentsResponse }));
            setViews(prev => ({ ...prev, ...viewsResponse }));
            setLikeAndDislike(prev => ({ ...prev, ...likeAndDislikeResponse }));
            fetchedPages.current.add(page);
        }
        setLoading(false);
    }, [loading, page, fetchUserPosts, postsLikeCount, postsDislikeCount, postsCommentCount, postsViewCount, postsLikeAndDislikeStatus, likes, dislikes, comments, views, likeAndDislike]);
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
            const postsCopy = { ...posts };
            delete postsCopy[postId];
            setPosts(postsCopy);
        }
    }, [dispatch, posts]);

    const handleUpdatePost = useCallback(async (postId) => {
        navigate(routesConfig.updatePost.replace(':postId', postId));
    }, [navigate]);



    useEffect(() => {
        getPosts();
    }, [getPosts, page]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                padding: { xs: '10px', md: '20px' }
            }}
        >
            <InfiniteScroll
                dataLength={Object.keys(posts).length}
                next={() => setPage(page + 1)}
                hasMore={hasMore}
                loader={
                    <CustomSkeleton
                        variant="rectangular"
                        width="100%"
                        height="100px"
                        count={2}
                    />
                }
                endMessage={
                    <Typography
                        sx={{
                            textAlign: 'center',
                            marginTop: 2
                        }}
                    >
                        No more posts
                    </Typography>
                }
            >
                {Object?.keys(posts).map(key => (
                    <CustomPostCard
                        key={key}
                        post={posts[key]}
                        user={userDetail}
                        likes={likes[key]}
                        dislikes={dislikes[key]}
                        comments={comments[key]}
                        shareUrl={`${frontendConfig.FRONTEND_URL}${routesConfig.post.replace(':postId', key)}`}
                        views={views[key]}
                        likeAndDislikeStatus={likeAndDislike[key]}
                        onLike={handleLikePost}
                        onDislike={handleDislikePost}
                        onRemoveLike={handleRemoveLike}
                        onRemoveDislike={handleRemoveDislike}
                        isUserPost={isUserPost}
                        onDelete={isUserPost?handleDeletePost:null}
                        onUpdate={isUserPost?handleUpdatePost:null}
                        setComments={setComments}
                        setViews={setViews}
                        setDislikes={setDislikes}
                        setLikes={setLikes}
                    />
                ))}
            </InfiniteScroll>
        </Box>
    );
};

UserPost.propTypes = {
    userDetail: PropTypes.object.isRequired,
    isUserPost: PropTypes.bool,
};

export default UserPost;