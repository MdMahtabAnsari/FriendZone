import {useCallback} from "react";
import {commentLikeAndDislikeStatus, setCommentLikeAndDislikeStatus} from "../../store/slices/comment/like.js";
import {useDispatch, useSelector} from "react-redux";

const useFetchCommentsLikeAndDislikeStatus = () => {
    const dispatch = useDispatch();
    const { likeAndDislikeStatus } = useSelector((state) => state?.commentLikes);
    return useCallback(async (comments) => {
        let status = {};
        let unSavedStatus = [];
        comments.forEach(comment => {
            if (!likeAndDislikeStatus[comment]) {
                unSavedStatus.push(comment);
            } else {
                status[comment] = likeAndDislikeStatus[comment];
            }
        });
        if(unSavedStatus.length === 0) return status;
        const response = await Promise.all(unSavedStatus.map(comment => dispatch(commentLikeAndDislikeStatus(comment))));
        response.forEach(res => {
            if (res?.payload?.success) {
                const data = res?.payload?.data;
                if (data) {
                    status[data?.commentId] = data;
                }
            }
        });
        unSavedStatus.forEach(comment => {
            if (!status[comment]) {
                dispatch(setCommentLikeAndDislikeStatus({commentId: comment, isLiked: false, isDisliked: false}));
                status[comment] = {commentId: comment, isLiked: false, isDisliked: false};
            }
        });
        return status;
    }, [dispatch, likeAndDislikeStatus]);
}

export default useFetchCommentsLikeAndDislikeStatus ;