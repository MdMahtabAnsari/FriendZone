import { useState, useEffect, useRef, useCallback } from "react";
import { CustomNotificationCard, CustomSkeleton } from '../components/index.js';
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from 'react-redux';
import { markNotificationAsRead } from '../store/slices/notification/notification.js';
import { useFetchUsers } from '../hooks/user/index.js';
import { useFetchNotifications } from '../hooks/notification/index.js';
import { Typography, Box, CircularProgress } from "@mui/material";
import routesConfig from "../routes/routes.js";
import { useNavigate } from "react-router-dom";

const Notification = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(false);
    const fetchedPages = useRef(new Set());
    const getNotificationsCalled = useRef(false);
    const { notifications: storedNotifications } = useSelector((state) => state.notifications);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const getUsers = useFetchUsers();
    const fetchNotifications = useFetchNotifications({ page, limit, setHasMore, notifications });

    const getNotifications = useCallback(async () => {
        if (loading || fetchedPages.current.has(page)) return;
        getNotificationsCalled.current = true;
        setLoading(true);
        const response = await fetchNotifications();
        if (response) {
            if (response.length === 0) {
                setHasMore(false);
                setLoading(false);
                fetchedPages.current.add(page);
                return;
            }
            const unSavedUsers = response.filter(notification => !users[notification?.triggeredBy]).map(notification => notification?.triggeredBy);
            const usersResponse = await getUsers(unSavedUsers);
            setNotifications((prev) => ([...prev, ...response]));
            setUsers((prev) => ({ ...prev, ...usersResponse }));
            fetchedPages.current.add(page);
        }
        setLoading(false);
        getNotificationsCalled.current = false;
    }, [fetchNotifications, page, users, getUsers, loading]);

    const getUpdatedNotifications = useCallback(async () => {
        const unSavedUsers = notifications.filter(notification => !users[notification?.triggeredBy]).map(notification => notification?.triggeredBy);
        const usersResponse = await getUsers(unSavedUsers);
        setUsers((prev) => ({ ...prev, ...usersResponse }));
        setLoading(false);
    }, [notifications, users, getUsers]);

    const handelMarkAsRead = useCallback(async (notificationId) => {
        const notificationIndex = notifications.findIndex(notification => notification._id === notificationId);
        if (notificationIndex === -1) return;
        if (!notifications[notificationIndex]?.isRead) {
            const response = await dispatch(markNotificationAsRead({ notificationId }));
            if (response?.payload?.success) {
                setNotifications((prev) => prev.map((notification, index) => {
                        if (index === notificationIndex) {
                            return { ...notification, isRead: true };
                        }
                        return notification;
                    }
                ));
            }
        }
        if (notifications[notificationIndex]?.type === 'user') {
            navigate(routesConfig.profile.replace(':userId', notifications[notificationIndex]?.triggeredBy));
        } else {
            navigate(routesConfig.post.replace(':postId', notifications[notificationIndex]?.postId));
        }
    }, [dispatch, navigate, notifications]);

    useEffect(() => {
        getNotifications();
    }, [getNotifications, page]);

    useEffect(() => {
        if (!getNotificationsCalled.current&&!loading &&(storedNotifications?.length > notifications?.length)) {
            let newNotifications = [];
            if(notifications.length === 0){
               newNotifications = [...storedNotifications];

            }
            else {
                let storedIndex = 0;
                while (storedIndex < storedNotifications.length) {
                    if (storedNotifications[storedIndex]?._id !== notifications[0]?._id) {
                        newNotifications.push(storedNotifications[storedIndex]);
                        storedIndex++;
                    } else {
                        break;
                    }

                }
            }
            if(newNotifications.length > 0){
                setLoading(true);
                setNotifications((prev) => ([...newNotifications, ...prev]));
                getUpdatedNotifications();
            }

        }
    }, [getUpdatedNotifications, loading, notifications, storedNotifications]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '800px', // Limits max width on larger screens
                margin: '0 auto',   // Centers on larger screens
                padding: { xs: '10px', md: '20px' } // Responsive padding
            }}
        >
            {loading && <CircularProgress />}
            <InfiniteScroll
                dataLength={notifications.length}
                next={() => setPage(page + 1)}
                hasMore={hasMore}
                loader={
                    <CustomSkeleton
                        variant="rectangular"
                        width="100%"
                        height="100px"
                        count={3}
                    />
                }
                endMessage={
                    <Typography variant="h6" sx={{ textAlign: 'center', margin: '20px 0' }}>
                        No more notifications
                    </Typography>
                }
            >
                {notifications?.map((notification) => {
                    return (
                        <CustomNotificationCard
                            key={notification?._id || notification?.id}
                            notification={notification}
                            triggeredUser={users[notification?.triggeredBy]}
                            onClick={handelMarkAsRead}
                        />
                    );
                })}
            </InfiniteScroll>
        </Box>
    );
}

export default Notification;