import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {commentLikeCount} from '../../store/slices/comment/like.js';

const useFetchLikesCount = () => {
    const dispatch = useDispatch();
    const { likeCount} = useSelector((state) => state?.commentLikes);
    return useCallback(async (comments) => {
        let likes = {};
        let unSavedLikes = [];
        comments.forEach(comment => {
            if (likeCount[comment]===undefined) {
                unSavedLikes.push(comment);
            } else {
                likes[comment] = likeCount[comment];
            }
        });
        if(unSavedLikes.length === 0) return likes;
        const response = await Promise.all(unSavedLikes.map(comment => dispatch(commentLikeCount(comment))));
        response.forEach(res => {
            if (res?.payload?.success) {
                const {commentId, likes: count} = res?.payload?.data;
                likes[commentId] = count;
            }
        });
        return likes;
    }, [dispatch, likeCount]);
};

export default useFetchLikesCount;