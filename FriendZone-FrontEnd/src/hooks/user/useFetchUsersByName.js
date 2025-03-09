import {useDispatch} from "react-redux";
import {getUserByNames} from '../../store/slices/user/user.js'
import {useCallback} from "react";

const useFetchUsersByName =(page,limit,setHasMore,users)=>{
    const dispatch = useDispatch();
   return useCallback(async (name)=>{
        const response = await dispatch(getUserByNames({name,page,limit}));
        if(response?.payload?.success){
            const newUsers = response.payload.data;
            if(newUsers.length === 0){
                setHasMore(false);
            }
            let formattedUsers = {};
            let isExist = 0;
            for(let user of newUsers){
                if(users[user?._id||user?.id]){
                    isExist++;
                }else{
                    formattedUsers[user?._id||user?.id] = user;
                }
            }
            if(isExist === newUsers.length){
                setHasMore(false);
            }
            return formattedUsers;
        }
        return {};
    },[dispatch, page, limit, setHasMore, users]);
}

export default useFetchUsersByName;