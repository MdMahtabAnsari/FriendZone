import {useSelector,useDispatch} from "react-redux";
import {getFollowings} from "../../store/slices/follower/follower.js"
import {useCallback} from "react";

const useFetchFollowing = (page, limit, setHasMore, followings,userId) => {
    const dispatch = useDispatch();
    const {followings: followingStore} = useSelector((state) => state.followers);
    return useCallback(async () => {
        const end = page * limit;
        if (followingStore[userId] && Object.keys(followingStore[userId]).length >= end) {
            const userFollowings = followingStore[userId];
            const keys = Object.keys(userFollowings)
            let formattedData = {}
            let index = 0
            let count = limit
            while (count && index < keys.length) {
                if (!followings[keys[index]]) {
                    formattedData[keys[index]] = userFollowings[keys[index]]
                    count--
                }
                index++
            }
            return formattedData
        }

        const response = await dispatch(getFollowings({userId, page, limit}))
        if (response?.payload?.success) {
            const receivedData = response?.payload?.data
            const formattedData = {}
            let existingDataCount = 0
            for (let data of receivedData) {
                if (followings[data?.followingId]) {
                    existingDataCount++
                } else {
                    formattedData[data?.followingId] = data
                }
            }
            if (existingDataCount === followings.length) {
                setHasMore(false)
            }
            return formattedData
        }
        return {}
    }, [dispatch, followingStore, followings, limit, page, setHasMore,userId]);
}

export default useFetchFollowing;