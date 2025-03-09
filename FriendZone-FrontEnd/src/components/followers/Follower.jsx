import { useFetchIsFollowing, useFetchFollowers } from '../../hooks/follower/index.js';
import { useFetchUsers } from '../../hooks/user/index.js';
import { CustomFollowerCard, CustomSkeleton } from '../index.js';
import { useEffect, useState, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, Typography } from '@mui/material';
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import {createFollower,deleteFollower} from '../../store/slices/follower/follower.js'
import {useDispatch} from 'react-redux';

const Follower = ({ userId }) => {
    const [followers, setFollowers] = useState({});
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
    const fetchFollowers = useFetchFollowers(page, limit, setHasMore, followers, userId);
    const fetchUsers = useFetchUsers();
    const fetchIsFollowing = useFetchIsFollowing();

    const getFollowers = useCallback(async () => {
        if (loading || fetchedPages.current.has(page)) return;
        setLoading(true);
        const response = await fetchFollowers();
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
            setFollowers((prev) => ({ ...prev, ...response }));
            setUsers((prev) => ({ ...prev, ...usersResponse }));
            setIsFollowing((prev) => ({ ...prev, ...isFollowingResponse }));
            fetchedPages.current.add(page);
        }
        setLoading(false);
    }, [loading, page, fetchedPages, fetchFollowers, users, isFollowing, fetchUsers, fetchIsFollowing]);

    const handleFollow =useCallback(async (followingId) => {
        const response = await dispatch(createFollower({followingId: followingId}));
        if(response?.payload?.success){
            setIsFollowing((prev) => ({...prev, [followingId]: true}));
        }
    }, [dispatch]);

    const handleUnFollow =useCallback(async (followingId) => {
        const response = await dispatch(deleteFollower({followingId: followingId}));
        if(response?.payload?.success){
            setIsFollowing((prev) => ({...prev, [followingId]: false}));
        }
    }, [dispatch]);

    useEffect(() => {
        getFollowers();
    }, [getFollowers, page]);

    useEffect(() => {
        setUser(authUser);
    }, [authUser]);

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
                dataLength={Object.keys(followers).length}
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
                        No more followers
                    </Typography>
                }
            >
                {Object.keys(followers).map((key) => (
                    <CustomFollowerCard
                        key={key}
                        follower={users[key]}
                        isFollow={isFollowing[key]}
                        onFollow={handleFollow}
                        onUnFollow={handleUnFollow}
                        isUser={user._id === key}
                    />
                ))}
            </InfiniteScroll>
        </Box>
         )

    );
};

Follower.propTypes = {
    userId: PropTypes.string.isRequired
}

export default Follower;