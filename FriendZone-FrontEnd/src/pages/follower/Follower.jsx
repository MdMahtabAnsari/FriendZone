import {CustomFollowerCard,CustomSkeleton} from '../../components/index.js'
import {useState,useEffect,useCallback,useRef} from "react";
import {useFetchFollowerSuggestion} from '../../hooks/follower/index.js'
import InfiniteScroll from 'react-infinite-scroll-component';
import {Box,Typography} from '@mui/material';
import {createFollower,removeFollowerSuggestions} from '../../store/slices/follower/follower.js'
import {useDispatch} from 'react-redux';


const FollowerSuggestions = () => {
        const [followers, setFollowers] = useState({});
        const [loading, setLoading] = useState(false);
        const [page, setPage] = useState(1);
        const [limit] = useState(10);
        const [hasMore, setHasMore] = useState(true);
        const fetchedPages = useRef(new Set());

        const dispatch = useDispatch();


        const fetchFollowerSuggestions = useFetchFollowerSuggestion(page, limit, setHasMore, followers);

        const getFollowers = useCallback(async () => {
                if (loading || fetchedPages.current.has(page)) return;
                setLoading(true);
                const response = await fetchFollowerSuggestions();
                if (response) {
                        const keys = Object.keys(response);
                        if (keys.length === 0) {
                                setHasMore(false);
                                setLoading(false);
                                fetchedPages.current.add(page);
                                return;
                        }
                        setFollowers((prev) => ({...prev, ...response}));
                        fetchedPages.current.add(page);
                }
                setLoading(false);


        }, [loading, page, fetchedPages, fetchFollowerSuggestions]);

        const handleFollow =useCallback(async (followingId) => {
                const response = await dispatch(createFollower({followingId: followingId}));
                if(response?.payload?.success){
                        dispatch(removeFollowerSuggestions(followingId));
                        setFollowers((prev) => {
                                const copy = {...prev};
                                delete copy[followingId];
                                return copy;
                        });

                }
        }, [dispatch]);

        useEffect(() => {
                getFollowers();
        }, [getFollowers, page]);

        return (
            <Box
                sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        
                }}
            >

                    <InfiniteScroll
                        dataLength={Object.keys(followers).length}
                        next={() => setPage(page + 1)}
                        hasMore={hasMore}
                        loader={<CustomSkeleton
                            variant="rectangular"
                            width="100%"
                            height="100px"
                            count={2}
                        />}
                        endMessage={
                                <Typography
                                    variant='h6'
                                    sx={{
                                            marginTop: 2,
                                            textAlign: 'center'
                                    }}
                                >
                                        No more suggestions
                                </Typography>
                        }
                    >
                            {
                                    Object?.keys(followers)?.map((key) => (
                                        <CustomFollowerCard
                                            key={key}
                                            follower={followers[key]}
                                            isFollow={false}
                                            onFollow={handleFollow}
                                            onUnFollow={() => {}}


                                        />
                                    ))
                            }
                    </InfiniteScroll>
            </Box>
        );
}

export default FollowerSuggestions;




