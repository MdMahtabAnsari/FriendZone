import {useSelector,useDispatch} from "react-redux";
import {getFollowers} from "../../store/slices/follower/follower.js"
import {useCallback} from "react";

const useFetchFollowers = (page, limit, setHasMore, followers,userId) => {
    const dispatch = useDispatch();
    const {followers: followerStore} = useSelector((state) => state.followers);

    return useCallback(async () => {
        const end = page * limit;
        if (followerStore[userId] && Object.keys(followerStore[userId]).length >= end) {
            const userFollowers = followerStore[userId];
            const keys = Object.keys(userFollowers)
            let formattedData = {}
            let index = 0
            let count = limit
            while (count && index < keys.length) {
                if (!followers[keys[index]]) {
                    formattedData[keys[index]] = userFollowers[keys[index]]
                    count--
                }
                index++
            }
            return formattedData
        }

        const response = await dispatch(getFollowers({userId, page, limit}))
        if (response?.payload?.success) {
            const receivedData = response?.payload?.data
            const formattedData = {}
            let existingDataCount = 0
            for (let data of receivedData) {
                if (followers[data?.followerId]) {
                    existingDataCount++
                } else {
                    formattedData[data?.followerId] = data
                }
            }
            if (existingDataCount === followers.length) {
                setHasMore(false)
            }
            return formattedData
        }
        return {}
    }, [dispatch, followerStore, followers, limit, page, setHasMore,userId]);
}

export default useFetchFollowers;