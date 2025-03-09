import { CustomPostCard, CustomSkeleton } from '../index.js';
import { useDispatch } from 'react-redux';
import { useEffect, useState, useCallback, useRef } from 'react';
import { setPostLikeAndDislikeStatus, likePost, dislikePost, removeDislike, removeLike, setLikeCount, setDislikeCount } from "../../store/slices/post/like.js";
import { useFetchPostsLikeAndDislikeStatus, useFetchViews, useFetchDislikesCount, useFetchLikesCount, useFetchPostByTags } from '../../hooks/post/index.js';
import { useFetchCommentsCount } from '../../hooks/comment/index.js';
import { useFetchUsers } from '../../hooks/user/index.js';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, Typography } from '@mui/material';
import PropTypes from "prop-types";

const PostByTags =({tags})=> {
    
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState({});
    const [likes, setLikes] = useState({});
    const [dislikes, setDislikes] = useState({});
    const [comments, setComments] = useState({});
    const [users, setUsers] = useState({});
    const [views, setViews] = useState({});
    const [likeAndDislike, setLikeAndDislike] = useState({});
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const fetchedPages = useRef(new Set());
    const fetchedTags = useRef(null);

    const dispatch = useDispatch();
    const fetchPostsByTags = useFetchPostByTags(page, limit, setHasMore, posts);
    const postsLikeCount = useFetchLikesCount();
    const postsDislikeCount = useFetchDislikesCount();
    const postsCommentCount = useFetchCommentsCount();
    const postsViewCount = useFetchViews();
    const postsLikeAndDislikeStatus = useFetchPostsLikeAndDislikeStatus();
    const getUsers = useFetchUsers();

    // get posts all details
    const getPosts = useCallback(async () => {
        if (loading || fetchedPages.current.has(page)) return;
        setLoading(true);
        const tagsArray = tags.split(' ');
        const response = await fetchPostsByTags(tagsArray);
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
            const unSavedUsers = keys.filter(key => !users[response[key]?.userId]).map(key => response[key]?.userId);
            const unSavedViews = keys.filter(key => !views[key]);
            const unSavedLikeAndDislike = keys.filter(key => !likeAndDislike[key]);
            const likesResponse = await postsLikeCount(unSavedLikes);
            const dislikesResponse = await postsDislikeCount(unSavedDislikes);
            const commentsResponse = await postsCommentCount(unSavedComments);
            const usersResponse = await getUsers(unSavedUsers);
            const viewsResponse = await postsViewCount(unSavedViews);
            const likeAndDislikeResponse = await postsLikeAndDislikeStatus(unSavedLikeAndDislike);
            setPosts((prev) => ({...prev, ...response}));
            setLikes((prev) => ({...prev, ...likesResponse}));
            setDislikes((prev) => ({...prev, ...dislikesResponse}));
            setComments((prev) => ({...prev, ...commentsResponse}));
            setUsers((prev) => ({...prev, ...usersResponse}));
            setViews((prev) => ({...prev, ...viewsResponse}));
            setLikeAndDislike((prev) => ({...prev, ...likeAndDislikeResponse}));
            fetchedPages.current.add(page);
        }
        setLoading(false);
    }, [loading, page, fetchPostsByTags, tags, postsLikeCount, postsDislikeCount, postsCommentCount, getUsers, postsViewCount, postsLikeAndDislikeStatus, likes, dislikes, comments, users, views, likeAndDislike]);

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
    
    useEffect(() => {
        if(fetchedTags.current !== tags){
            setPosts({});
            setLikes({});
            setDislikes({});
            setComments({});
            setUsers({});
            setViews({});
            setLikeAndDislike({});
            setPage(1);
            setHasMore(true);
            fetchedTags.current = tags;
        }
        getPosts()
    }, [getPosts, page, tags]);


    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '800px', // Limits max width on larger screens
                margin: '0 auto',   // Centers on larger screens
                padding: { xs: '10px', md: '20px' } // Responsive padding
            }}
        >
            <InfiniteScroll
                dataLength={Object?.keys(posts)?.length}
                next={() => setPage(page + 1)}
                hasMore={hasMore}
                loader={
                    <CustomSkeleton
                        variant="rectangular"
                        width="100%"
                        height="100px"
                        count={3}
                    />
                }
                endMessage={
                    <Typography variant="h6" sx={{ textAlign: 'center', margin: '20px 0' }}>
                        No more posts
                    </Typography>
                }
            >
                {Object?.keys(posts).map((key) => {
                    return (
                        <CustomPostCard
                            key={key}
                            post={posts[key]}
                            user={users[posts[key]?.userId]}
                            likes={likes[key]}
                            dislikes={dislikes[key]}
                            comments={comments[key]}
                            shareUrl={`https://example.com/posts/${key}`}
                            views={views[key]}
                            likeAndDislikeStatus={likeAndDislike[key]}
                            onLike={handleLikePost}
                            onDislike={handleDislikePost}
                            onRemoveLike={handleRemoveLike}
                            onRemoveDislike={handleRemoveDislike}
                            setComments={setComments}
                            setLikes={setLikes}
                            setDislikes={setDislikes}
                            setViews={setViews}
                        />
                    );
                })}
            </InfiniteScroll>
        </Box>
    );
}
    



PostByTags.propTypes = {
    tags: PropTypes.string.isRequired,
};

export default PostByTags;