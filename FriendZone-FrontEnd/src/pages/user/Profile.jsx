import { CustomProfileCard, CustomSwitchFollowerAndPost } from '../../components/index.js';
import { useSelector, useDispatch } from 'react-redux';
import {useState, useEffect, useCallback, useRef} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import routesConfig from '../../routes/routes.js';
import { Box } from '@mui/material';
import { useFetchUserById } from '../../hooks/user/index.js';
import { useFetchIsFollowing, useFetchFollowingCount, useFetchFollowerCount } from "../../hooks/follower/index.js";
import { useFetchUserPostCount } from "../../hooks/post/index.js";
import { createFollower, deleteFollower } from "../../store/slices/follower/follower.js";

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: logInUser } = useSelector((state) => state.auth);
    const {followingCount:storedFollowingCount} =useSelector((state) => state.followers);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(null);
    const [followingCount, setFollowingCount] = useState(null);
    const [followerCount, setFollowerCount] = useState(null);
    const [postCount, setPostCount] = useState(null);
    const fetchedUser = useRef(null);
    const dispatch = useDispatch();
    const fetchIsFollowing = useFetchIsFollowing();
    const fetchUserById = useFetchUserById();
    const fetchFollowingCount = useFetchFollowingCount();
    const fetchFollowerCount = useFetchFollowerCount();
    const fetchUserPostCount = useFetchUserPostCount();

    const getDetails = useCallback(async () => {
        if (loading ) return;
        setLoading(true);

            const user = await fetchUserById(userId);
            if (user) {
                setUser(user);

                const isFollowing = await fetchIsFollowing([userId]);
                const followingCount = await fetchFollowingCount(userId);
                const followerCount = await fetchFollowerCount(userId);
                const postCount = await fetchUserPostCount(userId);
                if (isFollowing[userId]) {
                    setIsFollowing(isFollowing[userId]);
                }
                if (followingCount >= 0) {
                    setFollowingCount(followingCount);
                }
                if (followerCount >= 0) {
                    setFollowerCount(followerCount);
                }
                if (postCount >= 0) {
                    setPostCount(postCount);
                }
                fetchedUser.current=userId;
                
            }
            setLoading(false);

    }, [loading, fetchUserById, userId, fetchIsFollowing, fetchFollowingCount, fetchFollowerCount, fetchUserPostCount]);
    

    const onEdit = useCallback(() => {
        navigate(routesConfig.updateProfile);
    }, [navigate]);

    const onFollow = useCallback(async (followingId) => {
        try {
            const response = await dispatch(createFollower({ followingId }));
            if (response?.payload?.success) {
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to follow user:", error);
        }
    }, [dispatch]);

    const onUnFollow = useCallback(async (followingId) => {
        try {
            const response = await dispatch(deleteFollower({ followingId }));
            if (response?.payload?.success) {
                setIsFollowing(false);
            }
        } catch (error) {
            console.error("Failed to unfollow user:", error);
        }
    }, [dispatch]);

    useEffect(() => {
        if (userId && (fetchedUser.current !== userId)) {
            getDetails();
        }
    }, [getDetails, userId]);

    useEffect(() => {
        if (logInUser && !userId) {
            setUser(logInUser);
        }
    }, [logInUser, userId]);
    
    useEffect(() => {
        if (!loading && storedFollowingCount[userId] >= 0 &&(storedFollowingCount[userId] !== followingCount) ) {
            setFollowingCount(storedFollowingCount[userId]);
        }
    }, [followingCount, loading, storedFollowingCount, userId]);

    return (
        user && logInUser && !loading && (
            <Box
                key={user._id}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: 2,
                }}
            >
                <CustomProfileCard
                    user={user}
                    followersCount={followerCount}
                    followingCount={followingCount}
                    postsCount={postCount}
                    isUser={user._id === logInUser._id}
                    isFollowing={isFollowing}
                    onEdit={onEdit}
                    onFollow={onFollow}
                    onUnfollow={onUnFollow}
                />
                <CustomSwitchFollowerAndPost userDetail={user} isUser={user._id === logInUser._id} />
            </Box>
        )
    );
};

export default Profile;