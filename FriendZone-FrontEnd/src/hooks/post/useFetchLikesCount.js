import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postLikeCount } from '../../store/slices/post/like.js';

const useFetchLikesCount = () => {
    const dispatch = useDispatch();
    const { likeCount } = useSelector((state) => state?.postLikes);

    return useCallback(async (posts) => {
        let likes = {};
        let unSavedLikes = [];
        // console.log("likeCount",Object.keys(likeCount));
        // console.log("likeCount",posts);
        posts.forEach(post => {
            if (likeCount[post]===undefined) {
                unSavedLikes.push(post);
            } else {
                likes[post] = likeCount[post];
            }
        });

        if (unSavedLikes.length === 0) return likes;
        // console.log("unSavedLikes",unSavedLikes);
        const response = await Promise.all(unSavedLikes.map(post => dispatch(postLikeCount(post))));
        response.forEach(res => {
            if (res?.payload?.success) {
                const { postId, likes: count } = res?.payload?.data;
                likes[postId] = count;
            }
        });

        return likes;
    }, [dispatch, likeCount]);
};

export default useFetchLikesCount;