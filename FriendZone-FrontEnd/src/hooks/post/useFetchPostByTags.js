import {useDispatch} from "react-redux";
import {getPostByTag} from '../../store/slices/post/post.js'
import {useCallback} from "react";

const useFetchPostByTags =(page,limit,setHasMore,posts)=>{
    const dispatch = useDispatch();
   return useCallback(async (tags)=>{
        const response = await dispatch(getPostByTag({tags,page,limit}));
        if(response?.payload?.success){
            const newPosts = response.payload.data;
            if(newPosts.length === 0){
                setHasMore(false);
            }
            let formattedPosts = {};
            let isExist = 0;
            for(let post of newPosts){
                if(posts[post?._id||post?.id]){
                    isExist++;
                }else{
                    formattedPosts[post?._id||post?.id] = post;
                }
            }
            if(isExist === newPosts.length){
                setHasMore(false);
            }
            return formattedPosts;
        }
        return {};
    },[dispatch, page, limit, setHasMore, posts]);
}

export default useFetchPostByTags;
