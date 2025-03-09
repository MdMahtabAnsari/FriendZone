import CustomComment from "./CustomComment.jsx";
import { useDispatch } from "react-redux";
import { useState, useEffect, useRef, useCallback } from "react";
import { useFetchDislikesCount, useFetchLikesCount, useFetchComments, useFetchCommentLikeAndDislikeStatus } from '../../hooks/comment/index.js';
import { useFetchUsers } from '../../hooks/user/index.js';
import { dislikeComment, likeComment, removeCommentDislike, removeCommentLike, setCommentDislikeCount, setCommentLikeAndDislikeStatus, setCommentLikeCount } from "../../store/slices/comment/like.js";
import { createComment, deleteComment, updateComment } from "../../store/slices/comment/comment.js";
import InfiniteScroll from 'react-infinite-scroll-component';
import { CustomSkeleton } from '../index.js';
import PropTypes from 'prop-types';
import { Typography, Box } from "@mui/material";
import CustomCommentInput from "./CustomCommentInput.jsx";
import useTheme from "../../hooks/useTheme.js";
import customBadWordsFilter from "../../utils/bad-words-filter/custom-bad-words-filter.js";

const CustomRootComment = ({ postId }) => {
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState(false);
    const [likes, setLikes] = useState({});
    const [dislikes, setDislikes] = useState({});
    const [likeAndDislike, setLikeAndDislike] = useState({});
    const [users, setUsers] = useState({});
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const fetchedPages = useRef(new Set());

    const dispatch = useDispatch();
    const theme = useTheme();
    const fetchComments = useFetchComments(page, limit, setHasMore, postId, comments, null);
    const commentsLikeCount = useFetchLikesCount();
    const commentsDislikeCount = useFetchDislikesCount();
    const commentsLikeAndDislikeStatus = useFetchCommentLikeAndDislikeStatus();
    const getUsers = useFetchUsers();

    const getComments = useCallback(async () => {
        if (loading || fetchedPages.current.has(page)) return;
        setLoading(true);
        const response = await fetchComments();
        console.log("getComments Called");
        if (response) {
            console.log("getComments Response", response);
            console.log('page', page);
            const keys = Object.keys(response);
            const unSavedLikes = keys.filter(key => !likes[key]);
            const unSavedDislikes = keys.filter(key => !dislikes[key]);
            const unSavedUsers = keys.filter(key => !users[response[key]?.userId]).map(key => response[key]?.userId);
            const unSavedLikeAndDislike = keys.filter(key => !likeAndDislike[key]);
            const likesResponse = await commentsLikeCount(unSavedLikes);
            const dislikesResponse = await commentsDislikeCount(unSavedDislikes);
            const usersResponse = await getUsers(unSavedUsers);
            const likeAndDislikeResponse = await commentsLikeAndDislikeStatus(unSavedLikeAndDislike);

            setComments((prev) => ({ ...prev, ...response }));
            setLikes((prev) => ({ ...prev, ...likesResponse }));
            setDislikes((prev) => ({ ...prev, ...dislikesResponse }));
            setUsers((prev) => ({ ...prev, ...usersResponse }));
            setLikeAndDislike((prev) => ({ ...prev, ...likeAndDislikeResponse }));
            fetchedPages.current.add(page);
        }
        setLoading(false);
    }, [loading, page, fetchComments, likes, dislikes, users, commentsLikeCount, commentsDislikeCount, getUsers, commentsLikeAndDislikeStatus, likeAndDislike]);

    const handleLikeComment = useCallback(async (commentId) => {
        if (likeAndDislike[commentId]?.isLiked) return;
        const response = await dispatch(likeComment(commentId));
        if (response?.payload?.success) {
            dispatch(setCommentLikeCount({ commentId, likes: likes[commentId] + 1 }));
            dispatch(setCommentLikeAndDislikeStatus({ commentId, isLiked: true, isDisliked: false }));
            setLikes((prev) => ({ ...prev, [commentId]: likes[commentId] + 1 }));
            setLikeAndDislike((prev) => ({ ...prev, [commentId]: { commentId, isLiked: true, isDisliked: false } }));
            if (likeAndDislike[commentId]?.isDisliked) {
                dispatch(setCommentDislikeCount({ commentId, dislikes: dislikes[commentId] - 1 }));
                setDislikes((prev) => ({ ...prev, [commentId]: dislikes[commentId] - 1 }));
            }
        }
    }, [likeAndDislike, dispatch, likes, dislikes]);

    const handleDislikeComment = useCallback(async (commentId) => {
        if (likeAndDislike[commentId]?.isDisliked) return;
        const response = await dispatch(dislikeComment(commentId));
        if (response?.payload?.success) {
            dispatch(setCommentDislikeCount({ commentId, dislikes: dislikes[commentId] + 1 }));
            dispatch(setCommentLikeAndDislikeStatus({ commentId, isLiked: false, isDisliked: true }));
            setDislikes((prev) => ({ ...prev, [commentId]: dislikes[commentId] + 1 }));
            setLikeAndDislike((prev) => ({ ...prev, [commentId]: { commentId, isLiked: false, isDisliked: true } }));
            if (likeAndDislike[commentId]?.isLiked) {
                dispatch(setCommentLikeCount({ commentId, likes: likes[commentId] - 1 }));
                setLikes((prev) => ({ ...prev, [commentId]: likes[commentId] - 1 }));
            }
        }
    }, [likeAndDislike, dispatch, dislikes, likes]);

    const handleRemoveLike = useCallback(async (commentId) => {
        if (!likeAndDislike[commentId]?.isLiked) return;
        const response = await dispatch(removeCommentLike(commentId));
        if (response?.payload?.success) {
            dispatch(setCommentLikeCount({ commentId, likes: likes[commentId] - 1 }));
            dispatch(setCommentLikeAndDislikeStatus({ commentId, isLiked: false, isDisliked: false }));
            setLikes((prev) => ({ ...prev, [commentId]: likes[commentId] - 1 }));
            setLikeAndDislike((prev) => ({ ...prev, [commentId]: { commentId, isLiked: false, isDisliked: false } }));
        }
    }, [likeAndDislike, dispatch, likes]);

    const handleRemoveDislike = useCallback(async (commentId) => {
        if (!likeAndDislike[commentId]?.isDisliked) return;
        const response = await dispatch(removeCommentDislike(commentId));
        if (response?.payload?.success) {
            dispatch(setCommentLikeCount({ commentId, dislikes: dislikes[commentId] - 1 }));
            dispatch(setCommentLikeAndDislikeStatus({ commentId, isLiked: false, isDisliked: false }));
            setDislikes((prev) => ({ ...prev, [commentId]: dislikes[commentId] - 1 }));
            setLikeAndDislike((prev) => ({ ...prev, [commentId]: { commentId, isLiked: false, isDisliked: false } }));
        }
    }, [likeAndDislike, dispatch, dislikes]);

    const handleEdit = useCallback(async (commentId, newCommentText) => {
        if (comments[commentId]?.replies?.length > 0) return;
        const response = await dispatch(updateComment({ commentId, comment: newCommentText }));
        if (response?.payload?.success) {
            const updatedComment = response?.payload?.data;
            setComments((prev) => ({ ...prev, [commentId]: updatedComment }));
        }
    }, [comments, dispatch]);

    const handleDelete = useCallback(async (commentId) => {
        if (comments[commentId]?.replies?.length > 0) return;
        const response = await dispatch(deleteComment(commentId));
        if (response?.payload?.success) {
            setComments((prev) => {
                const newComments = { ...prev };
                delete newComments[commentId];
                return newComments;
            });
            if (Object.keys(comments).length <= 1) {
                setHasMore(false);
            }
        }
    }, [comments, dispatch]);

    const handleAddComment = useCallback(async ({ comment, postId }) => {
        setError(null);
        if(customBadWordsFilter.isProfane(comment)) {
            setError("Comment contains bad words");
            return;
        }
        const response = await dispatch(createComment({ comment, postId }));
        if (response?.payload?.success) {
            const newComment = response?.payload?.data;
            setComments((prev) => ({ ...prev, [newComment._id]: newComment }));
            dispatch(setCommentLikeCount({ commentId: newComment._id, likes: 0 }));
            dispatch(setCommentDislikeCount({ commentId: newComment._id, dislikes: 0 }));
            dispatch(setCommentLikeAndDislikeStatus({ commentId: newComment._id, isLiked: false, isDisliked: false }));
            setLikes((prev) => ({ ...prev, [newComment._id]: 0 }));
            setDislikes((prev) => ({ ...prev, [newComment._id]: 0 }));
            setLikeAndDislike((prev) => ({ ...prev, [newComment._id]: { commentId: newComment._id, isLiked: false, isDisliked: false } }));
            if(!hasMore){
                setHasMore(true);
            }
           
        }
    }, [dispatch, hasMore]);

    useEffect(() => {
        getComments();
    }, [page, limit, hasMore, getComments]);

    return (
        <>
            <Box
                id="scrollableDiv"
                sx={{
                    height: '400px',  // set a fixed height
                    overflowY: 'auto',  // enable vertical scrolling
                    scrollbarWidth: 'none',  // hide scrollbar for Firefox
                    '&::-webkit-scrollbar': {
                        display: 'none',  // hide scrollbar for WebKit browsers
                    },
                    padding: '0 16px',  // add padding if needed
                    backgroundColor: theme.palette.background.default,  // apply background color based on theme
                    color: theme.palette.text.primary,  // apply text color based on theme

                }}
            >
                <InfiniteScroll
                    dataLength={Object.keys(comments).length}
                    next={() => {
                        console.log('Fetching next page');
                        setPage((prev) => prev + 1);
                    }}
                    hasMore={hasMore}
                    loader={
                        <CustomSkeleton
                            sx={{
                                width: '100%',
                                height: '100px',
                                borderRadius: '10px',
                                margin: '10px 0'
                            }}
                        />
                    }
                    endMessage={
                        <Typography variant="h6" sx={{ textAlign: 'center', margin: '20px 0' }}>
                            No more comments
                        </Typography>
                    }
                    scrollableTarget="scrollableDiv"
                >
                    {Object.keys(comments)?.map((key) => {
                        return (
                            <CustomComment
                                key={key}
                                userComment={comments[key]}
                                user={users[comments[key]?.userId]}
                                likeCount={likes[key]}
                                dislikeCount={dislikes[key]}
                                likeAndDislikeStatus={likeAndDislike[key]}
                                onLike={handleLikeComment}
                                onDislike={handleDislikeComment}
                                onRemoveLike={handleRemoveLike}
                                onRemoveDislike={handleRemoveDislike}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        );
                    })}
                </InfiniteScroll>
            </Box>
            {
                error && (
                    <Box sx={{ color: 'red', textAlign: 'center', mt: 2 }}>
                        {error}
                    </Box>
                )
            }
            <CustomCommentInput postId={postId} onSubmit={handleAddComment} />
        </>
    );
};

CustomRootComment.propTypes = {
    postId: PropTypes.string.isRequired
};

export default CustomRootComment;