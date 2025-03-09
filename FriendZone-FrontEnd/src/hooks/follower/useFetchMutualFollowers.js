import {useSelector,useDispatch} from "react-redux";
import {getMutualFollowers} from "../../store/slices/follower/follower.js"
import {useCallback} from "react";

const useFetchMutualFollowers = (page, limit, setHasMore, mutualFollowers,userId) => {
    const dispatch = useDispatch();
    const {mutualFollowers: mutualFollowersStore} = useSelector((state) => state.followers);

    return useCallback(async () => {
        const end = page * limit;
        if (mutualFollowersStore[userId] && Object.keys(mutualFollowersStore[userId]).length >= end) {
            const userMutualFollowers = mutualFollowersStore[userId];
            const keys = Object.keys(userMutualFollowers)
            let formattedData = {}
            let index = 0
            let count = limit
            while (count && index < keys.length) {
                if (!mutualFollowers[keys[index]]) {
                    formattedData[keys[index]] = userMutualFollowers[keys[index]]
                    count--
                }
                index++
            }
            return formattedData
        }

        const response = await dispatch(getMutualFollowers({userId, page, limit}))
        if (response?.payload?.success) {
            const {mutualFollowers:receivedMutualFollowers} = response?.payload?.data
            const formattedData = {}
            let existingDataCount = 0
            for (let data of receivedMutualFollowers) {
                if (mutualFollowers[data?.id || data?._id]) {
                    existingDataCount++
                } else {
                    formattedData[data?.id || data?._id] = data
                }
            }
            if (existingDataCount === mutualFollowers.length) {
                setHasMore(false)
            }
            return formattedData
        }
        return {}
    }, [dispatch, mutualFollowersStore, mutualFollowers, limit, page, setHasMore,userId]);
}

export default useFetchMutualFollowers;