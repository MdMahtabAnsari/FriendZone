import React, { useState, useRef, useMemo, useEffect,useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { CustomCarousel, CustomIconButton, CustomShareDialog, CustomImage, CustomVideoPlayer, CustomRootComment } from './index';
import { ThumbUp, ThumbDown, ChatBubbleOutline, Share, Visibility, MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from "moment-timezone";
import { useSelector,useDispatch } from "react-redux";
import {createPostView} from '../store/slices/post/view.js'
import {Link} from "react-router-dom";
import routerConfig from "../routes/routes.js";

const CustomPostCard = ({
                            post = {},
                            user = {},
                            likes = 0,
                            dislikes = 0,
                            comments = 0,
                            shareUrl,
                            onLike,
                            onDislike,
                            onRemoveLike,
                            onRemoveDislike,
                            likeAndDislikeStatus = { isLiked: false, isDisliked: false },
                            setComments,
                            setViews,
                            setLikes,
                            setDislikes,
                            views = 0,
                            isUserPost = false,
                            onUpdate,
                            onDelete
                        }) => {
    const [isShareDialogOpen, setShareDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const mediaRefs = useRef({});
    const { images = [], videos = [], content, createdAt, tags = [] } = post;
    const id = post?._id || post?.id;
    const { name, image: profilePic } = user;
    const { isLiked, isDisliked } = likeAndDislikeStatus;
    const { commentCount } = useSelector((state) => state.comments);
    const {viewCount} = useSelector((state) => state.postViews);
    const {likeCount,dislikeCount} = useSelector((state) => state.postLikes);
    const [isViewed, setIsViewed] = useState(false);
    const [isDispatched, setIsDispatched] = useState(false);
    const dispatch = useDispatch();

    const [showComments, setShowComments] = useState(false);

    const handleShareClick = () => setShareDialogOpen(true);
    const handleShareDialogClose = () => setShareDialogOpen(false);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const progressHandler =useCallback (async(progress) => {
        const progressInPercentage = Math.round(progress.played * 100);
        if(progressInPercentage >= 50 && !isViewed && !isDispatched) {
            setIsViewed(true);
            setIsDispatched(true);
           const response = await dispatch(createPostView(id));
           if(response?.payload?.success) {
               console.log('View added successfully');
           }
           else{
               setIsViewed(false);
                setIsDispatched(false);
           }
        }
    }, [isViewed, isDispatched, dispatch, id]);

    const handelZoomedForDuration = useCallback(async(pubId) => {
       if(pubId && !isViewed && !isDispatched) {
           setIsViewed(true);
           setIsDispatched(true);
           const response = await dispatch(createPostView(id));
           if(response?.payload?.success) {
               console.log('View added successfully');
           }
           else{
               setIsViewed(false);
               setIsDispatched(false);
           }
           
       }
    }, [dispatch, id, isDispatched, isViewed]);

    const mediaItems = useMemo(() => [
        ...images.map((url) => ({
            type: 'image',
            url,
            ref: mediaRefs.current[url] = mediaRefs.current[url] || React.createRef(),
        })),
        ...videos.map((url) => ({
            type: 'video',
            url,
            ref: mediaRefs.current[url] = mediaRefs.current[url] || React.createRef(),
        })),
    ], [images, videos]);

    const mediaPlayers = mediaItems.map((item) =>
        item.type === 'image' ? (
            <CustomImage key={item.url} ref={item.ref} publicId={item.url} alt="Image" width={'600px'} height={'400px'} sx={{ outline: 'none' }} css={{ objectFit: 'cover' }} onZoomedForDuration={handelZoomedForDuration} />
        ) : (
            <CustomVideoPlayer key={item.url} ref={item.ref} publicId={item.url} controls preload="auto" width={'600px'} height={'400px'} sx={{ outline: 'none' }} css={{ objectFit: 'cover' }} onProgress={progressHandler}/>
        )
    );

    useEffect(() => {
        if (commentCount && commentCount[id]!==undefined && (commentCount!==comments)) {
            setComments((prev) => ({ ...prev, [id]: commentCount[id] }));
        }
        if(viewCount && viewCount[id]!==undefined && (viewCount!==views)) {
            setViews((prev) => ({ ...prev, [id]: viewCount[id] }));
        }
        if(likeCount && likeCount[id]!==undefined && (likeCount!==likes)) {
            setLikes((prev) => ({ ...prev, [id]: likeCount[id] }));
        }
        if(dislikeCount && dislikeCount[id]!==undefined && (dislikeCount!==dislikes)) {
            setDislikes((prev) => ({ ...prev, [id]: dislikeCount[id] }));
        }
    }, [commentCount, comments, dislikeCount, dislikes, id, likeCount, likes, setComments, setDislikes, setLikes, setViews, viewCount, views]);

    return (
        <Box
            sx={{
                border: '1px solid #e6e6e6',
                borderRadius: '8px',
                padding: '10px',
                backgroundColor: (theme) => theme.palette.background.paper,
                marginBottom: '20px',
                width: '100%',
                maxWidth: '600px',
                margin: 'auto',
                objectFit: 'cover',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Avatar src={profilePic} alt={name} sx={{ marginRight: '10px' }} />

                <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Link to={routerConfig.profile.replace(':userId', (user?._id || user?.id))} color="inherit" style={{ textDecoration: 'none', color: 'inherit' }}>
                    {name}
                    </Link>
                </Typography>

                {isUserPost && (
                    <>
                        <IconButton onClick={handleMenuOpen} sx={{ marginLeft: 'auto' }}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => { onUpdate(id); handleMenuClose(); }}>Update</MenuItem>
                            <MenuItem onClick={() => { onDelete(id); handleMenuClose(); }}>Delete</MenuItem>
                        </Menu>
                    </>
                )}
            </Box>

            <Typography variant="body2" sx={{ margin: '10px 0' }}>
                {`Posted ${moment(createdAt).fromNow()}`}
            </Typography>

            {(images?.length > 0 || videos?.length > 0) && (
                <CustomCarousel items={mediaPlayers} itemWidth="600px" itemHeight="400px" />
            )}

            {content && <Typography variant="body2" sx={{ margin: '10px 0' }}>{content}</Typography>}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                {tags?.map((tag, index) => (
                    <Typography key={index} variant="caption" sx={{ fontSize: '0.8rem', color: 'primary.main' }}>
                        {`#${tag}`}
                    </Typography>
                ))}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: '10px',
                    justifyContent: 'space-around',
                    marginTop: '10px',
                }}
            >
                <CustomIconButton label={`${likes} Likes`} color={isLiked ? 'primary' : 'inherit'} onClick={isLiked ? () => onRemoveLike(id) : () => onLike(id)} icon={<ThumbUp />} />
                <CustomIconButton label={`${dislikes} Dislikes`} color={isDisliked ? 'primary' : 'inherit'} onClick={isDisliked ? () => onRemoveDislike(id) : () => onDislike(id)} icon={<ThumbDown />} />
                <CustomIconButton label={`${comments} Comments`} onClick={() => setShowComments(prevState => !prevState)} icon={<ChatBubbleOutline />} />
                <CustomIconButton label={`${views} Views`} icon={<Visibility />} />
                <CustomIconButton label="Share" onClick={handleShareClick} icon={<Share />} />
            </Box>

            {isShareDialogOpen && (
                <CustomShareDialog
                    open={isShareDialogOpen}
                    onClose={handleShareDialogClose}
                    title="Share this post"
                    shareUrl={shareUrl}
                    platforms={['facebook', 'twitter', 'linkedin', 'whatsapp']}
                />
            )}
            {showComments && <CustomRootComment postId={id} />}
        </Box>
    );
};

CustomPostCard.propTypes = {
    post: PropTypes.shape({
        images: PropTypes.arrayOf(PropTypes.string),
        videos: PropTypes.arrayOf(PropTypes.string),
        content: PropTypes.string.isRequired,
    }).isRequired,
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        image: PropTypes.string,
    }).isRequired,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
    comments: PropTypes.number,
    shareUrl: PropTypes.string.isRequired,
    onLike: PropTypes.func.isRequired,
    onDislike: PropTypes.func.isRequired,
    likeAndDislikeStatus: PropTypes.object.isRequired,
    views: PropTypes.number.isRequired,
    onRemoveLike: PropTypes.func.isRequired,
    onRemoveDislike: PropTypes.func.isRequired,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
    isUserPost: PropTypes.bool,
    setComments: PropTypes.func.isRequired,
    setLikes: PropTypes.func.isRequired,
    setDislikes: PropTypes.func.isRequired,
    setViews: PropTypes.func.isRequired,

};

export default CustomPostCard;
