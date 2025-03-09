import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {commentDislikeCount} from '../../store/slices/comment/like.js';

const useFetchDislikesCount = () => {
    const dispatch = useDispatch();
    const { dislikeCount} = useSelector((state) => state?.commentLikes);
    return useCallback(async (comments) => {
        let dislikes = {};
        let unSavedDislikes = [];
        comments.forEach(comment => {
            if (dislikeCount[comment]===undefined) {
                unSavedDislikes.push(comment);
            } else {
                dislikes[comment] = dislikeCount[comment];
            }
        });
        if(unSavedDislikes.length === 0) return dislikes;
        const response = await Promise.all(unSavedDislikes.map(comment => dispatch(commentDislikeCount(comment))));
        response.forEach(res => {
            if (res?.payload?.success) {
                const {commentId, dislikes: count} = res?.payload?.data;
                dislikes[commentId] = count;
            }
        });
        return dislikes;
    }, [dispatch, dislikeCount]);
};

export default useFetchDislikesCount;