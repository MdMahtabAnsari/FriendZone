import { useCallback } from "react";
import { postLikeAndDislikeStatus, setPostLikeAndDislikeStatus } from "../../store/slices/post/like.js";
import { useDispatch, useSelector } from "react-redux";

const useFetchPostsLikeAndDislikeStatus = () => {
    const dispatch = useDispatch();
    const { likeAndDislikeStatus } = useSelector((state) => state?.postLikes);

    return useCallback(async (posts) => {
        let status = {};
        let unSavedStatus = [];
        // console.log("likeAndDislikeStatus",Object.keys(likeAndDislikeStatus));
        // console.log("likeAndDislikeStatus",posts);
        posts.forEach(post => {
            if (!likeAndDislikeStatus[post]) {
                unSavedStatus.push(post);
            } else {
                status[post] = likeAndDislikeStatus[post];
            }
        });

        if (unSavedStatus.length === 0) return status;
        // console.log("unSavedStatus",unSavedStatus);
        const response = await Promise.all(unSavedStatus.map(post => dispatch(postLikeAndDislikeStatus(post))));
        response.forEach(res => {
            if (res?.payload?.success) {
                const data = res?.payload?.data;
                if (data) {
                    status[data?.postId] = data;
                }
            }
        });

        unSavedStatus.forEach(post => {
            if (!status[post]) {
                dispatch(setPostLikeAndDislikeStatus({ postId: post, isLiked: false, isDisliked: false }));
                status[post] = { postId: post, isLiked: false, isDisliked: false };
            }
        });

        return status;
    }, [dispatch, likeAndDislikeStatus]);
}

export default useFetchPostsLikeAndDislikeStatus;