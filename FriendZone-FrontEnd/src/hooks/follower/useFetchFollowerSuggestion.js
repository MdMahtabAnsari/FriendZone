import {useSelector,useDispatch} from "react-redux";
import {getFollowerSuggestions} from "../../store/slices/follower/follower.js"
import {useCallback} from "react";

const useFetchFollowerSuggestion = (page, limit, setHasMore, followers) => {
    const dispatch = useDispatch();
    const {followerSuggestions} = useSelector((state) => state.followers);

    return useCallback(async () => {
        const end = page * limit;
        if(Object.keys(followerSuggestions).length >= end) {
           const keys = Object.keys(followerSuggestions)
            let formattedData = {}
            let index = 0
            let count = limit
            while (count && index < keys.length) {
               if(!followers[keys[index]]) {
                   formattedData[keys[index]] = followerSuggestions[keys[index]]
                   count--
               }
                index++
            }
            return formattedData
        }

        const response = await dispatch(getFollowerSuggestions({page, limit}))
        if(response?.payload?.success) {
            const receivedData = response?.payload?.data
            const formattedData = {}
            let existingDataCount = 0
            for(let data of receivedData) {
                if(followers[data?._id || data?.id]) {
                    existingDataCount++
                } else {
                    formattedData[data?._id || data?.id] = data
                }
            }
            if(existingDataCount === followers.length) {
                setHasMore(false)
            }
            return formattedData
        }
        return {}


    },[dispatch, followerSuggestions, followers, limit, page, setHasMore]);

}

export default useFetchFollowerSuggestion;