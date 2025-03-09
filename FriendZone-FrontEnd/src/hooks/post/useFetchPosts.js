import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { randomPosts, recommendedPosts } from '../../store/slices/post/post.js';
import { refreshToken } from '../../store/slices/auth/auth-slice.js';

const useFetchPosts = (postState, page, limit, setPostState, setHasMore, posts) => {
    const dispatch = useDispatch();
    const { posts: postStore } = useSelector((state) => state?.posts);

    return useCallback(async () => {
        let response = null;
        const end = page * limit;
        // console.log("postStore",Object.keys(postStore));
        // console.log("postStore",posts);
        if (Object.keys(postStore).length >= end) {
            let count = limit;
            let formattedPosts = {};
            const keys = Object.keys(postStore);
            let index = 0;

            while (count && index < keys.length) {
                if (!posts[keys[index]]) {
                    formattedPosts[keys[index]] = postStore[keys[index]];
                    count--;
                }
                index++;
            }
            return formattedPosts;
        }

        if (postState === 'recommended') {
            response = await dispatch(recommendedPosts({ page, limit }));
            if (!response?.payload?.success) {
                setPostState('token');
            } else if (response?.payload?.data?.length === 0) {
                setHasMore(false);
            }
        } else if (postState === 'random') {
            response = await dispatch(randomPosts());
        } else if (postState === 'token') {
            response = await dispatch(refreshToken());
            if (response?.payload?.success) {
                setPostState('recommended');
            } else {
                setPostState('random');
            }
        }

        if (response?.payload?.success) {
            const receivedPosts = response?.payload?.data;
            const formattedPosts = {};
            let existingPostsCount = 0;
            for (let post of receivedPosts) {
                if (posts[post?._id || post?.id]) {
                    existingPostsCount++;
                } else {
                    formattedPosts[post?._id || post?.id] = post;
                }
            }
            if (existingPostsCount === posts.length) {
                setHasMore(false);
            }
            return formattedPosts;
        }

        return {};
    }, [dispatch, postState, page, limit, setPostState, setHasMore, postStore, posts]);
};

export default useFetchPosts;