import {useSelector,useDispatch} from "react-redux";
import {getFollowersCount} from "../../store/slices/follower/follower.js"
import {useCallback} from "react";

const useFetchFollowerCount = ()=>{
    const dispatch = useDispatch();
    const {followersCount} = useSelector((state) => state.followers);

    return useCallback(async (userId) => {
        if (followersCount[userId]) return followersCount[userId];
        const response = await dispatch(getFollowersCount(userId));
        if(response?.payload?.success) {
            return response?.payload?.data?.count;
        }
        return null;
    }, [dispatch, followersCount])

}

export default useFetchFollowerCount;