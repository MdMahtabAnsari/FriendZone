import { useFetchIsFollowing } from '../hooks/follower/index.js';
import { CustomFollowerCard, CustomSkeleton } from './index.js';
import { useEffect, useState, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, Typography } from '@mui/material';
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import {createFollower, deleteFollower} from '../store/slices/follower/follower.js'
import {useFetchUsersByName} from '../hooks/user/index.js'
import {useDispatch} from 'react-redux';

const UsersByName = ({ userName }) => {
    const [users,setUsers] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [limit] = useState(10);
    const [isFollowing, setIsFollowing] = useState({});
    const [user, setUser] = useState({});
    const {user:authUser} = useSelector((state) => state.auth);
    const fetchedPages = useRef(new Set());
    const fetchedUserName = useRef(null);

    const dispatch = useDispatch();
    const fetchUsersByName = useFetchUsersByName(page, limit, setHasMore, users);
    const fetchIsFollowing = useFetchIsFollowing();

    const getUsers = useCallback(async () => {
        if (loading || fetchedPages.current.has(page)) return;
        setLoading(true);
        const response = await fetchUsersByName(userName);
        if (response) {
            const keys = Object.keys(response);
            if (keys.length === 0) {
                setHasMore(false);
                setLoading(false);
                fetchedPages.current.add(page);
                return;
            }
            const unSavedIsFollowing = keys.filter((key) => !isFollowing[key]);
            const isFollowingResponse = await fetchIsFollowing(unSavedIsFollowing);
            setUsers((prev) => ({ ...prev, ...response }));
            setIsFollowing((prev) => ({ ...prev, ...isFollowingResponse }));
            fetchedPages.current.add(page);
        }
        setLoading(false);
    }, [loading, page, fetchUsersByName, userName, fetchIsFollowing, isFollowing]);

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
       if(userName !== fetchedUserName.current){
           setPage(1);
           setUsers({});
           fetchedPages.current = new Set();
           fetchedUserName.current = userName;
       }
       getUsers();
       
    }, [getUsers, page, userName]);

    useEffect(() => {
        setUser(authUser);
    }, [authUser]);

    return(
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
                    dataLength={Object.keys(users).length}
                    next={() => setPage((prev) => prev + 1)}
                    hasMore={hasMore}
                    loader={<CustomSkeleton
                        variant="rectangular"
                        width="100%"
                        height="100px"
                        count={2}
                    />}
                    endMessage={
                        <Typography
                            sx={{
                                textAlign: 'center',
                                marginTop: 2
                            }}
                        >
                            No more users
                        </Typography>
                    }
                >
                    {Object?.keys(users)?.map((key) => (
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
    )

}

UsersByName.propTypes = {
    userName: PropTypes.string.isRequired
}

export default UsersByName;