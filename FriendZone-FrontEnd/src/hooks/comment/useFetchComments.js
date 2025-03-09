import { useSelector, useDispatch } from "react-redux";
import { fetchComments } from '../../store/slices/comment/comment.js';
import { useCallback } from 'react';

const useFetchComments = (page, limit, setHasMore, postId, comments ={}, parentCommentId = null) => {
    const dispatch = useDispatch();
    const { rootComments, replies } = useSelector((state) => state?.comments);

    return useCallback(async () => {
        const end = page * limit;
        let formattedComments = {};

        if (parentCommentId && replies[parentCommentId] && Object.keys(replies[parentCommentId]).length >= end) {
            let count = limit;
            const keys = Object.keys(replies[parentCommentId]);
            console.log(keys);
            let index = 0;
            while (count && index < keys.length) {
                if (!comments[keys[index]]) {
                    formattedComments[keys[index]] = replies[parentCommentId][keys[index]];
                    count--;
                }
                index++;
            }
            return formattedComments;
        }

        if (!parentCommentId && rootComments[postId] && Object.keys(rootComments[postId]).length >= end) {
            let count = limit;
            const keys = Object.keys(rootComments[postId]);
            console.log(keys);
            let index = 0;
            while (count && index < keys.length) {
                if (!comments[keys[index]]) {
                    formattedComments[keys[index]] = rootComments[postId][keys[index]];
                    count--;
                }
                index++;
            }
            return formattedComments;
        }

        const response = await dispatch(fetchComments({ postId, parentCommentId ,  page, limit }));
        if (response?.payload?.success) {
            const data = response.payload.data;
            if (data?.length === 0) {
                setHasMore(false);
            } else {
                data.forEach((comment) => {
                    formattedComments[comment._id] = comment;
                });
            }
        }
        return formattedComments;
    }, [page, limit, parentCommentId, replies, comments, rootComments, postId, dispatch, setHasMore]);
};

export default useFetchComments;