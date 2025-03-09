import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";

const initialState = {
    notifications: [],
    unreadNotificationCount: 0
}

export const fetchNotifications = createAsyncThunk(
    '/notifications/get',
    async ({ page, limit }) => {
        try {
            const response = await instance.get(`/api/notifications/get`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    '/notifications/mark/read',
    async ({ notificationId }) => {
        try {
            const response = await instance.put(`/api/notifications/mark-read`, { notificationId });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const getUnreadNotificationCount = createAsyncThunk(
    '/notifications/unread/count',
    async () => {
        try {
            const response = await instance.get(`/api/notifications/get/unread-count`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
       incrementUnreadNotificationCount: (state) => {
              state.unreadNotificationCount++;
       },
        decrementUnreadNotificationCount: (state) => {
                state.unreadNotificationCount--;
        },
       setNotifications: (state, action) => {
           const notification = action.payload;
              state.notifications=[notification,...state.notifications];
       }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                if(!action?.payload?.success) return;
                const data = action.payload?.data;
               const notificationSet = new Set(state.notifications.map(notification => notification._id));
                state.notifications = [...state.notifications, ...data.filter(notification => !notificationSet.has(notification._id))];
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                if(!action?.payload?.success) return;
                const data = action.payload?.data;
                state.notifications = state.notifications.map(notification => {
                    if (notification._id === data._id) {
                        notification.isRead = true;
                    }
                    return notification;
                });
                state.unreadNotificationCount--;
            })
            .addCase(getUnreadNotificationCount.fulfilled, (state, action) => {
                if(!action?.payload?.success) return;
                const { count } = action.payload?.data;
                if(count >= 0) state.unreadNotificationCount = count;
            });
    }
});


export const { setNotifications,incrementUnreadNotificationCount,decrementUnreadNotificationCount } = notificationSlice.actions;

export default notificationSlice.reducer;