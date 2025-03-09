import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {commentCount as postCommentCount} from '../../store/slices/comment/comment.js';

const useFetchCommentsCount = () => {
    const dispatch = useDispatch();
    const { commentCount } = useSelector((state) => state.comments);
    return useCallback(async (posts) => {
        let comments = {};
        let unSavedComments = [];
        posts.forEach(post => {
            if (commentCount[post]===undefined) {
                unSavedComments.push(post);
            } else {
                comments[post] = commentCount[post];
            }
        });
        if(unSavedComments.length === 0) return comments;
        const responses = await Promise.all(unSavedComments.map(post => dispatch(postCommentCount(post))));
        responses.forEach(res => {
            if (res?.payload?.success) {
                const {postId, count} = res.payload?.data;
                comments[postId] = count;
            }
        });
        return comments;
    }, [dispatch, commentCount]);
};

export default useFetchCommentsCount;