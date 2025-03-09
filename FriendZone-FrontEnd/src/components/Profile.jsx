// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, Avatar, Typography} from '@mui/material';
import {CustomButton} from './index.js'
import PropTypes from 'prop-types';

const ProfileHeader = ({ user={} ,followersCount,followingCount,postsCount,isFollowing,onFollow,onUnfollow,onEdit,isUser=false}) => {
    const { name, image, bio} = user;
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2 }}>
            <Avatar
                src={image}
                alt={name}
                sx={{ width: 100, height: 100, marginBottom: 2 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {name}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 1 }}>
                <Typography variant="body1">
                    <strong>{postsCount}</strong> posts
                </Typography>
                <Typography variant="body1">
                    <strong>{followersCount}</strong> followers
                </Typography>
                <Typography variant="body1">
                    <strong>{followingCount}</strong> following
                </Typography>
            </Box>
            {/*if user profile */}
            {isUser ? (
                <CustomButton
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2 }}
                    onClick={onEdit}
                    text='Edit Profile'
                />
            ) : (
                <CustomButton text={isFollowing ? 'Unfollow' : 'Follow'} onClick={()=>isFollowing?onUnfollow(user?.id||user?._id):onFollow(user?.id||user?._id)} sx={{ marginTop: 2 }} />
            )}
            <Typography variant="body2" sx={{ marginTop: 2, textAlign: 'center' }}>
                {bio}
            </Typography>
        </Box>
    );
};

ProfileHeader.propTypes = {
    user: PropTypes.object.isRequired,
    followersCount: PropTypes.number.isRequired,
    followingCount: PropTypes.number.isRequired,
    postsCount: PropTypes.number.isRequired,
    isFollowing: PropTypes.bool,
    onFollow: PropTypes.func,
    onUnfollow: PropTypes.func,
    onEdit: PropTypes.func,
    isUser: PropTypes.bool.isRequired
}
export default ProfileHeader;