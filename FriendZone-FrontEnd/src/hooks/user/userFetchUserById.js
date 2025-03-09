import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById } from '../../store/slices/user/user.js';

const useFetchUserById = () => {
    const dispatch = useDispatch();
    const { users: userStore } = useSelector(state => state.users);

    return useCallback(async (userId) => {
        if (userStore[userId]) return userStore[userId];
        const response = await dispatch(getUserById(userId));
        if (response?.payload?.success) {
            return response?.payload?.data;
        }
        return null;
    }, [dispatch, userStore]);
}

export default useFetchUserById;