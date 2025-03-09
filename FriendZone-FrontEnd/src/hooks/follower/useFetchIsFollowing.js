import {useSelector,useDispatch} from "react-redux";
import {isFollowing} from "../../store/slices/follower/follower.js"
import {useCallback} from "react";

const useFetchIsFollowing = ()=>{
    const dispatch = useDispatch();
    const {isFollowing: isFollowingStore} = useSelector((state) => state.followers);

    return useCallback(async (userIds=[]) => {
        let isFollowingData = {}
        let unSavedIsFollowing = []
        for (let userId of userIds) {
            if (isFollowingStore[userId]) {
                isFollowingData[userId] = isFollowingStore[userId]
            } else {
                unSavedIsFollowing.push(userId)
            }
        }
        if (unSavedIsFollowing.length === 0) {
            return isFollowingData
        }
        const response = await Promise.all(unSavedIsFollowing.map(userId => dispatch(isFollowing({userId}))))
        response.forEach(res => {
            if (res?.payload?.success) {
                const {followingId, isFollowing} = res?.payload?.data
                isFollowingData[followingId] = isFollowing
            }
        })
        return isFollowingData
    }, [dispatch, isFollowingStore])

}

export default useFetchIsFollowing;