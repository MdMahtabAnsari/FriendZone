import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postViewCount } from '../../store/slices/post/view.js';

const useFetchViews = () => {
    const dispatch = useDispatch();
    const { viewCount } = useSelector((state) => state.postViews);

    return useCallback(async (posts) => {
        let views = {};
        let unSavedViews = [];
        // console.log("viewCount",Object.keys(viewCount));
        // console.log("viewCount",posts);
        posts.forEach(post => {
            if (viewCount[post]===undefined) {
                unSavedViews.push(post);
            } else {
                views[post] = viewCount[post];
            }
        });

        if (unSavedViews.length === 0) return views;
        // console.log("unSavedViews",unSavedViews);
        const response = await Promise.all(unSavedViews.map(post => dispatch(postViewCount(post))));
        response.forEach(res => {
            if (res?.payload?.success) {
                const { postId, views: count } = res?.payload?.data;
                views[postId] = count;
            }
        });

        return views;
    }, [dispatch, viewCount]);
};

export default useFetchViews;