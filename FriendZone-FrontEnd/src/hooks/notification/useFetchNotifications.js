import {useDispatch,useSelector} from "react-redux";
import {useCallback} from "react";
import {fetchNotifications} from "../../store/slices/notification/notification.js";

const useFetchNotifications = ({page, limit, setHasMore,notifications=[]}) => {
    const {notifications:storedNotifications} =useSelector((state)=>state.notifications);
    const dispatch = useDispatch();
    return useCallback(async () => {
        const end = page * limit;
        const notificationsSet = new Set(notifications);
        if(storedNotifications.length>=end){
            let count=limit;
            let formattedNotifications = []
            let index=0;
            while(count && index<storedNotifications.length){
                if(!notificationsSet[storedNotifications[index]._id || storedNotifications[index].id]){
                    formattedNotifications.push(storedNotifications[index]);
                    count--;
                }
                index++;
            }
            return formattedNotifications;
        }
        const response = await dispatch(fetchNotifications({page, limit}));
       if(response?.payload?.success) {
           const data = response?.payload?.data;
              if(data.length===0){
                setHasMore(false);
            }
              let formattedNotifications = [];
                for (let i = 0; i < data.length; i++) {
                    if (!notificationsSet.has(data[i]._id || data[i].id)) {
                        formattedNotifications.push(data[i]);
                    }
                }
                return formattedNotifications
       }
         return [];

    }, [dispatch, limit, notifications, page, setHasMore, storedNotifications]);
}

export default useFetchNotifications;