import { useFetchIsFollowing, useFetchFollowing } from '../../hooks/follower/index.js';
import { useFetchUsers } from '../../hooks/user/index.js';
import { CustomFollowerCard, CustomSkeleton } from '../index.js';
import { useEffect, useState, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, Typography } from '@mui/material';
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import {createFollower,deleteFollower,setFollowingCount} from '../../store/slices/follower/follower.js'
import {useDispatch} from 'react-redux';

const Following = ({ userId,isUser=false }) => {
    const [following, setFollowing] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState({});
    const [limit] = useState(10);
    const [isFollowing, setIsFollowing] = useState({});
    const [user, setUser] = useState({});
    const {user:authUser} = useSelector((state) => state.auth);
    const fetchedPages = useRef(new Set());

    const dispatch = useDispatch();
    const fetchFollowing = useFetchFollowing(page, limit, setHasMore, following, userId);
    const fetchUsers = useFetchUsers();
    const fetchIsFollowing = useFetchIsFollowing();

    const getFollowing = useCallback(async () => {
        if (loading || fetchedPages.current.has(page)) return;
        setLoading(true);
        const response = await fetchFollowing();
        if (response) {
            const keys = Object.keys(response);
            if (keys.length === 0) {
                setHasMore(false);
                setLoading(false);
                fetchedPages.current.add(page);
                return;
            }
            const unSavedUsers = keys.filter((key) => !users[key]);
            const unSavedIsFollowing = keys.filter((key) => !isFollowing[key]);
            const usersResponse = await fetchUsers(unSavedUsers);
            const isFollowingResponse = await fetchIsFollowing(unSavedIsFollowing);
            setFollowing((prev) => ({ ...prev, ...response }));
            setUsers((prev) => ({ ...prev, ...usersResponse }));
            setIsFollowing((prev) => ({ ...prev, ...isFollowingResponse }));
            fetchedPages.current.add(page);
        }
        setLoading(false);
    }, [loading, page, fetchedPages, fetchFollowing, users, isFollowing, fetchUsers, fetchIsFollowing]);


    const handleFollow =useCallback(async (followingId) => {
        const response = await dispatch(createFollower({followingId: followingId}));
        if(response?.payload?.success){
            setIsFollowing((prev) => ({...prev, [followingId]: true}));
        }
    }, [dispatch]);
    
    const handleUnFollow =useCallback(async (followingId) => {
        const response = await dispatch(deleteFollower({followingId: followingId}));
        if(response?.payload?.success){
            if(isUser){
                setFollowing((prev) => {
                    const copy = {...prev};
                    delete copy[followingId];
                    return copy;
                });
                dispatch(setFollowingCount(-1));
            }
            setIsFollowing((prev) => ({...prev, [followingId]: false}));
        }
    }, [dispatch, isUser]);

    useEffect(() => {
        getFollowing();
    }, [getFollowing, page]);

    useEffect(() => {
        setUser(authUser);
    },[authUser]);

    return (
        user && (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
            }}
        >
            <InfiniteScroll
                dataLength={Object.keys(following).length}
                next={() => setPage((prev) => prev + 1)}
                hasMore={hasMore}
                loader={<CustomSkeleton
                    variant='rectangular'
                    width='100%'
                    height='100px'
                    count={2}
                />}
                endMessage={
                    <Typography
                        variant='body1'
                        sx={{
                            marginTop: 2,
                            textAlign: 'center'
                        }}
                    >
                        No more following
                    </Typography>
                }
            >
                {Object.keys(following).map((key) => (
                    <CustomFollowerCard
                        key={key}
                        follower={users[key]}
                        isFollow={isFollowing[key]}
                        onUnFollow={handleUnFollow}
                        onFollow={handleFollow}
                        isUser={user._id === key}
                    />
                ))}
            </InfiniteScroll>
        </Box>
        )
    );
}

Following.propTypes = {
    userId: PropTypes.string.isRequired,
    isUser: PropTypes.bool.isRequired
}

export default Following;