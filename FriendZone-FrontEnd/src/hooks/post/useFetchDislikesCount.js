import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postDislikeCount } from '../../store/slices/post/like.js';

const useFetchDislikesCount = () => {
    const dispatch = useDispatch();
    const { dislikeCount } = useSelector((state) => state?.postLikes);

    return useCallback(async (posts) => {
        let dislikes = {};
        let unSavedDislikes = [];
        // console.log("dislikesCount",Object.keys(dislikeCount));
        // console.log("dislikesCount",posts);
        posts.forEach(post => {
            if (dislikeCount[post]===undefined) {
                unSavedDislikes.push(post);
            } else {
                dislikes[post] = dislikeCount[post];
            }
        });

        if (unSavedDislikes.length === 0) return dislikes;
        // console.log("unSavedDislikes",unSavedDislikes);
        const response = await Promise.all(unSavedDislikes.map(post => dispatch(postDislikeCount(post))));
        response.forEach(res => {
            if (res?.payload?.success) {
                const { postId, dislikes: count } = res?.payload?.data;
                dislikes[postId] = count;
            }
        });

        return dislikes;
    }, [dispatch, dislikeCount]);
};

export default useFetchDislikesCount;