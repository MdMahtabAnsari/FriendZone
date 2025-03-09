import { useFetchIsFollowing, useFetchMutualFollowers } from '../../hooks/follower/index.js';
import { CustomFollowerCard, CustomSkeleton } from '../index.js';
import { useEffect, useState, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, Typography } from '@mui/material';
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import {createFollower,deleteFollower} from '../../store/slices/follower/follower.js'
import {useDispatch} from 'react-redux';

const MutualFollower = ({ userId }) => {
    const [mutualFollowers,setMutualFollowers] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [limit] = useState(10);
    const [isFollowing, setIsFollowing] = useState({});
    const [user, setUser] = useState({});
    const {user:authUser} = useSelector((state) => state.auth);
    const fetchedPages = useRef(new Set());

    const dispatch = useDispatch();
   const fetchMutualFollowers = useFetchMutualFollowers(page, limit, setHasMore, mutualFollowers, userId);
   const fetchIsFollowing = useFetchIsFollowing();

   const getMutualFollowers = useCallback(async () => {
         if (loading || fetchedPages.current.has(page)) return;
         setLoading(true);
         const response = await fetchMutualFollowers();
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
                setMutualFollowers((prev) => ({ ...prev, ...response }));
              setIsFollowing((prev) => ({ ...prev, ...isFollowingResponse }));
              fetchedPages.current.add(page);
         }
         setLoading(false);
   }, [loading, page, fetchedPages, fetchMutualFollowers, isFollowing, fetchIsFollowing]);

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
            getMutualFollowers();
    }, [getMutualFollowers, page]);

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
                dataLength={Object.keys(mutualFollowers).length}
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
                        No more mutual followers
                    </Typography>
                }
            >
                {Object?.keys(mutualFollowers)?.map((key) => (
                    <CustomFollowerCard
                        key={key}
                       follower={mutualFollowers[key]}
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

MutualFollower.propTypes = {
    userId: PropTypes.string.isRequired
}

export default MutualFollower;