import {useSelector,useDispatch} from "react-redux";
import {useCallback} from "react";
import {getUserPostCount} from '../../store/slices/post/post.js';

const useFetchUserPostCount = ()=>{
    const dispatch = useDispatch();
    const {userPostCount} = useSelector((state) => state.posts);

    return useCallback(async (userId) => {
        if (userPostCount[userId]) return userPostCount[userId];
        const response = await dispatch(getUserPostCount(userId));
        if(response?.payload?.success) {
            return response?.payload?.data?.count;
        }
        return null;
    }, [dispatch, userPostCount])
}

export default useFetchUserPostCount;