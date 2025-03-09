import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFilteredUsers } from '../../store/slices/user/user.js';

const useFetchUsers = () => {
    const dispatch = useDispatch();
    const { users: userStore } = useSelector(state => state.users);

    return useCallback(async (userIds) => {
        let users = {};
        const uniqueUsers = [...new Set(userIds)];
        if (uniqueUsers.length === 0) return users;

        const indexSet = new Set();
        let index = 0;
        uniqueUsers.forEach((user) => {
            if (!userStore[user]) {
                indexSet.add(index);
            } else {
                users[user] = userStore[user];
            }
            index++;
        });

        if (indexSet.size === 0) return users;

        index = 0;
        const unSavedUsers = [];
        uniqueUsers.forEach((user) => {
            if (indexSet.has(index)) {
                unSavedUsers.push(user);
            }
            index++;
        });

        const response = await dispatch(getFilteredUsers(unSavedUsers));
        if (response?.payload?.success) {
            const usersData = response?.payload?.data;
            usersData.forEach(user => {
                users[user._id] = user;
            });
        }
        return users;
    }, [dispatch, userStore]);
};

export default useFetchUsers;