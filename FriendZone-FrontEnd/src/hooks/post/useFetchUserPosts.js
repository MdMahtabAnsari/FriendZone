import {useSelector,useDispatch} from "react-redux";
import {useCallback} from "react";
import {userPosts} from '../../store/slices/post/post.js';


const useFetchUserPosts = ( page, limit, setHasMore, posts,userId) => {
    const {userPosts:userStoredPost} = useSelector((state) => state?.posts);
    const dispatch = useDispatch();
   return useCallback(async () => {

        const end = page * limit;
        if (userStoredPost[userId] && Object.keys(userStoredPost[userId]).length >= end) {
            const userPostsDetail = userStoredPost[userId];
            let count = limit;
            let formattedPosts = {};
            const keys = Object.keys(userPostsDetail);
            let index = 0;

            while (count && index < keys.length) {
                if (!posts[keys[index]]) {
                    formattedPosts[keys[index]] = userPostsDetail[keys[index]];
                    count--;
                }
                index++;
            }
            return formattedPosts;
        }
       const  response = await dispatch(userPosts({userId,page,limit}));
        if (!response?.payload?.success) {
            setHasMore(false);
        } else if (response?.payload?.data?.length === 0) {
            setHasMore(false);
        }
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
    
    
       
   },[dispatch, limit, page, posts, setHasMore, userId, userStoredPost]);
}

export default useFetchUserPosts;