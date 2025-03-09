import {useSelector,useDispatch} from "react-redux";
import {getFollowingCount} from "../../store/slices/follower/follower.js"
import {useCallback} from "react";

const useFetchFollowingCount = ()=>{
    const dispatch = useDispatch();
    const {followingCount} = useSelector((state) => state.followers);

    return useCallback(async (userId) => {
        if (followingCount[userId]) return followingCount[userId];
        const response = await dispatch(getFollowingCount(userId));
        if(response?.payload?.success) {
            return response?.payload?.data?.count;
        }
        return null;
    }, [dispatch, followingCount])
}

export default useFetchFollowingCount;