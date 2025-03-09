import Avatar from '@atlaskit/avatar';
import Comment, { CommentAction, CommentAuthor, CommentTime } from '@atlaskit/comment';
import PropTypes from 'prop-types';
import  { useState, useRef, useEffect, useCallback } from 'react';
import { useFetchComments, useFetchLikesCount, useFetchCommentLikeAndDislikeStatus, useFetchDislikesCount } from '../../hooks/comment/index.js';
import { useFetchUsers } from '../../hooks/user/index.js';
import { useDispatch, useSelector } from 'react-redux';
import { likeComment, dislikeComment, removeCommentDislike, removeCommentLike, setCommentLikeAndDislikeStatus, setCommentDislikeCount, setCommentLikeCount } from '../../store/slices/comment/like.js';
import { updateComment, deleteComment, createComment } from '../../store/slices/comment/comment.js';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CustomSkeleton, CustomInput, CustomIconButton } from '../index.js';
import { Typography, Box,useTheme } from '@mui/material';
import { ThumbUp, ThumbDown, Reply, Save } from '@mui/icons-material';
import moment from 'moment-timezone';
import CustomCommentInput from './CustomCommentInput.jsx';
import routerConfig from "../../routes/routes.js";
import {Link} from "react-router-dom";
import customBadWordsFilter from "../../utils/bad-words-filter/custom-bad-words-filter.js";

const CustomComment = ({ userComment, user, onLike, onDislike, onRemoveLike, onRemoveDislike, onEdit, onDelete, likeCount, dislikeCount, likeAndDislikeStatus }) => {
    const { _id: commentId, comment, postId, replies, createdAt } = userComment;
    const { _id: userId, name, image } = user;
    const [likes, setLikes] = useState({});
    const [dislikes, setDislikes] = useState({});
    const [likeAndDislike, setLikeAndDislike] = useState({});
    const [comments, setComments] = useState({});
    const [showReplies, setShowReplies] = useState(false);
    const [users, setUsers] = useState({});
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [commentText, setCommentText] = useState(comment);
    const fetchedPages = useRef(new Set());
    const [editMode, setEditMode] = useState(false);
    const [replyMode, setReplyMode] = useState(false);
    const [error, setError] = useState(null);
    const { user: authUser } = useSelector((state) => state?.auth);
    const theme = useTheme();

    const fetchLikesCount = useFetchLikesCount();
    const fetchDislikesCount = useFetchDislikesCount();
    const fetchCommentLikeAndDislikeStatus = useFetchCommentLikeAndDislikeStatus();
    const fetchComments = useFetchComments(page, limit, setHasMore, postId, comments, commentId);
    const fetchUsers = useFetchUsers();

    const dispatch = useDispatch();

    const getComments = useCallback(async () => {
        if (loading || fetchedPages.current.has(page)) return;
        setLoading(true);
        const response = await fetchComments();
        if (response) {
            const keys = Object.keys(response);
            const unSavedLikes = keys.filter(key => !likes[key]);
            const unSavedDislikes = keys.filter(key => !dislikes[key]);
            const unSavedUsers = keys.filter(key => !users[response[key]?.userId]).map(key => response[key]?.userId);
            const unSavedLikeAndDislike = keys.filter(key => !likeAndDislike[key]);
            const likesResponse = await fetchLikesCount(unSavedLikes);
            const dislikesResponse = await fetchDislikesCount(unSavedDislikes);
            const usersResponse = await fetchUsers(unSavedUsers);
            const likeAndDislikeResponse = await fetchCommentLikeAndDislikeStatus(unSavedLikeAndDislike);
            setComments((prev) => ({ ...prev, ...response }));
            setLikes((prev) => ({ ...prev, ...likesResponse }));
            setDislikes((prev) => ({ ...prev, ...dislikesResponse }));
            setUsers((prev) => ({ ...prev, ...usersResponse }));
            setLikeAndDislike((prev) => ({ ...prev, ...likeAndDislikeResponse }));
            fetchedPages.current.add(page);
        }
        setLoading(false);
    }, [loading, page, fetchComments, likes, dislikes, users, fetchLikesCount, fetchDislikesCount, fetchUsers, fetchCommentLikeAndDislikeStatus, likeAndDislike]);

    // Like comment
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

    // Dislike comment
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

    // Remove like
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

    // Remove dislike
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
            if(Object.keys(comments).length <= 1) {
                setShowReplies(false);
                setHasMore(false);
            }
        }
    }, [comments, dispatch]);

    const handleReply = useCallback(async ({ comment, postId, parentCommentId }) => {
        setError(null);
        if (!replyMode) return;
        if(customBadWordsFilter.isProfane(comment)) {
            setError("Comment contains bad words");
            return;
        }
        const response = await dispatch(createComment({ comment, postId, parentCommentId }));
        if (response?.payload?.success) {
            const newComment = response?.payload?.data;
            setComments((prev) => ({ ...prev, [newComment._id]: newComment }));
            dispatch(setCommentLikeCount({ commentId: newComment._id, likes: 0 }));
            dispatch(setCommentDislikeCount({ commentId: newComment._id, dislikes: 0 }));
            dispatch(setCommentLikeAndDislikeStatus({ commentId: newComment._id, isLiked: false, isDisliked: false }));
            setLikes((prev) => ({ ...prev, [newComment._id]: 0 }));
            setDislikes((prev) => ({ ...prev, [newComment._id]: 0 }));
            setLikeAndDislike((prev) => ({ ...prev, [newComment._id]: { commentId: newComment._id, isLiked: false, isDisliked: false } }));
            if(!users[newComment?.userId]){
                const userResponse = await fetchUsers([newComment?.userId]);
                setUsers((prev) => ({ ...prev, ...userResponse }));
            }
            if (!hasMore) {
                setHasMore(true);
            }
        }
        setReplyMode(false);
    }, [replyMode, dispatch, hasMore, users, fetchUsers]);

    const getOptions = useCallback(() => {
        let options = [];
        if (authUser?._id === userId && replies?.length === 0) {
            options = [
                <CommentAction onClick={() => setShowReplies(!showReplies)}>{showReplies ? 'Hide Replies' : 'Show Replies'}</CommentAction>,
                <CommentAction onClick={() => setReplyMode((prevState) => !prevState)}><Reply color='inherit' /></CommentAction>,
                <CommentAction onClick={() => likeAndDislikeStatus?.isLiked ? onRemoveLike(commentId) : onLike(commentId)}> {likeCount} <ThumbUp color={likeAndDislikeStatus?.isLiked ? 'primary' : 'inherit'} /> </CommentAction>,
                <CommentAction onClick={() => likeAndDislikeStatus?.isDisliked ? onRemoveDislike(commentId) : onDislike(commentId)}> {dislikeCount} <ThumbDown color={likeAndDislikeStatus?.isDisliked ? 'primary' : 'inherit'} /> </CommentAction>,
                <CommentAction onClick={() => setEditMode(!editMode)}>{editMode ? 'Cancel' : 'Edit'}</CommentAction>,
                <CommentAction onClick={() => onDelete(commentId)}>Delete</CommentAction>,
            ];
        } else if (authUser?._id !== userId || (authUser?._id === userId && replies?.length > 0)) {
            options = [
                <CommentAction onClick={() => setShowReplies(!showReplies)}>{showReplies ? 'Hide Replies' : 'Show Replies'}</CommentAction>,
                <CommentAction onClick={() => setReplyMode((prevState) => !prevState)}><Reply color='inherit' /> </CommentAction>,
                <CommentAction onClick={() => likeAndDislikeStatus?.isLiked ? onRemoveLike(commentId) : onLike(commentId)}>{likeCount} <ThumbUp color={likeAndDislikeStatus?.isLiked ? 'primary' : 'inherit'} /> </CommentAction>,
                <CommentAction onClick={() => likeAndDislikeStatus?.isDisliked ? onRemoveDislike(commentId) : onDislike(commentId)}>{dislikeCount} <ThumbDown color={likeAndDislikeStatus?.isDisliked ? 'primary' : 'inherit'} /> </CommentAction>,
            ];
        }
        return options;
    }, [authUser?._id, userId, showReplies, likeAndDislikeStatus.isLiked, onRemoveLike, onLike, likeCount, likeAndDislikeStatus.isDisliked, onRemoveDislike, onDislike, dislikeCount, editMode, commentId, onDelete, replies?.length]);

    useEffect(() => {
        if (showReplies) {
            getComments();
        }
    }, [getComments, showReplies, page, limit, hasMore]);

    return (
        <Comment
            avatar={<Avatar src={image} />}
            author={<CommentAuthor ><Link to={routerConfig.profile.replace(':userId', (user?._id || user?.id))} color="inherit" style={{ textDecoration: 'none', color: 'inherit' }}>
                {name}
            </Link></CommentAuthor>}
            time={<CommentTime>{`${moment(createdAt).fromNow()}`}</CommentTime>}
            content={
                <Typography variant="body1" component="div">
                    {editMode ? (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <CustomInput value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                            <CustomIconButton onClick={() => { onEdit(commentId, commentText); setEditMode(false); }} icon={<Save />} label={'Save'} />
                        </Box>
                    ) : <Typography variant="body1" component="span" sx={{ color:theme.palette.text.primary }}>{comment}</Typography>}
                </Typography>
            }
            actions={getOptions()}
        >
            {
                error && (
                    <Box sx={{ color: 'red', textAlign: 'center', mt: 2 }}>
                        {error}
                    </Box>
                )
            }
            {replyMode && (
                <CustomCommentInput onSubmit={handleReply} postId={postId} parentCommentId={commentId} currentUser={user} />
            )}
            {showReplies && (
                <InfiniteScroll
                    dataLength={Object.keys(comments)?.length}
                    next={() => setPage(page + 1)}
                    hasMore={hasMore}
                    loader={
                        <CustomSkeleton
                            sx={{
                                width: '100%',
                                height: '100px',
                                maxWidth: '800px',
                                margin: '0 auto'
                            }}
                            count={limit}
                            height="100px"
                            width={'100%'}
                            variant="rectangular"
                        />
                    }
                    endMessage={
                        <Typography variant="h6" sx={{ textAlign: 'center', margin: '20px 0' }}>
                            No more replies
                        </Typography>
                    }
                >
                    {Object.keys(comments)?.map((key) => (
                        <CustomComment
                            key={key}
                            userComment={comments[key]}
                            user={users[comments[key]?.userId]}
                            onLike={handleLikeComment}
                            onDislike={handleDislikeComment}
                            onRemoveLike={handleRemoveLike}
                            onRemoveDislike={handleRemoveDislike}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            likeCount={likes[key]}
                            dislikeCount={dislikes[key]}
                            likeAndDislikeStatus={likeAndDislike[key]}
                        />
                    ))}
                </InfiniteScroll>
            )}
        </Comment>
    );
};

CustomComment.propTypes = {
    userComment: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    onLike: PropTypes.func.isRequired,
    onDislike: PropTypes.func.isRequired,
    onRemoveLike: PropTypes.func.isRequired,
    onRemoveDislike: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    likeCount: PropTypes.number.isRequired,
    dislikeCount: PropTypes.number.isRequired,
    likeAndDislikeStatus: PropTypes.object.isRequired,
};

export default CustomComment;