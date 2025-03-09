import Following from "./Following.jsx";
import Followers from "./Follower.jsx";
import MutualFollower from "./MutualFollower.jsx";
import { CustomUserPost, CustomButton } from '../index.js';
import {  useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from "prop-types";

const SwitchFollowerAndPost = ({ userDetail, isUser = false }) => {
    const [tab, setTab] = useState(0);

    return (
        <Box
            key={userDetail?.id || userDetail?._id} // Add key prop here
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                width: '100%'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    width: '100%'
                }}
            >
                <CustomButton text={'Followers'} onClick={() => setTab(0)}
                              sx={{
                                  backgroundColor: tab === 0 ? 'grey.300' : 'primary.main',

                              }}
                />
                <CustomButton text={'Following'} onClick={() => setTab(1)}
                              sx={{
                                  backgroundColor: tab === 1 ? 'grey.300' : 'primary.main',

                              }}/>
                {!isUser && <CustomButton text={'Mutual Followers'} onClick={() => setTab(2)}
                                          sx={{
                                              backgroundColor: tab === 2 ? 'grey.300' : 'primary.main',

                                          }}
                />}
                <CustomButton text={'Posts'} onClick={() => setTab(3)}
                              sx={{
                                  backgroundColor: tab === 3 ? 'grey.300' : 'primary.main',

                              }}/>
            </Box>
            {tab === 0 && <Followers userId={userDetail?.id || userDetail?._id} />}
            {tab === 1 && <Following userId={userDetail?.id || userDetail?._id} isUser={isUser} />}
            {tab === 2 && <MutualFollower userId={userDetail?.id || userDetail?._id} />}
            {tab === 3 && <CustomUserPost userDetail={userDetail} isUserPost={isUser} />}
        </Box>
    );
};

SwitchFollowerAndPost.propTypes = {
    userDetail: PropTypes.object.isRequired,
    isUser: PropTypes.bool.isRequired,
}

export default SwitchFollowerAndPost;