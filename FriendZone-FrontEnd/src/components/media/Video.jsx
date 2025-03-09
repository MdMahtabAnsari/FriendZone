import { useRef, useEffect, forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import { Box, CircularProgress, Typography } from '@mui/material';
// import frontendConfig from '../../configs/frontend-config.js';

const VideoPlayer = forwardRef(({
                                    publicId,
                                    width = '640px',
                                    height = '360px',
                                    controls = true,
                                    loop = false,
                                    onProgress = () => {},
                                    visibilityThreshold = 0.5,
                                    sx = {},
                                }, ref) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef(null);

    // const cloudinaryVideoUrl = publicId
    //     ? `https://res.cloudinary.com/${frontendConfig.CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}`
    //     : '';

    useEffect(() => {
        if (!('IntersectionObserver' in window)) {
            setIsVisible(true); // Fallback for unsupported browsers
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { root: null, threshold: visibilityThreshold }
        );

        if (videoRef.current) observer.observe(videoRef.current);

        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, [visibilityThreshold]);

    return (
        <Box
            ref={videoRef}
            sx={{
                width,
                height,
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                ...sx,
            }}
        >
            {isLoading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        zIndex: 1,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}
            {publicId ? (
                <ReactPlayer
                    ref={ref}
                    url={publicId}
                    width="100%"
                    height="100%"
                    playing={isVisible} // Auto-pause when not visible
                    controls={controls}
                    loop={loop}
                    onReady={() => setIsLoading(false)} // Hide loader when ready
                    onProgress={onProgress}
                    className="react-player"
                />
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        width: '100%',
                        height: '100%',
                        padding: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        border: '1px dashed rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <Typography variant="body1" color="textSecondary">
                        Video not available
                    </Typography>
                </Box>
            )}
        </Box>
    );
});

VideoPlayer.displayName = 'VideoPlayer';

// Prop types for documentation and error-checking
VideoPlayer.propTypes = {
    publicId: PropTypes.string.isRequired,
    width: PropTypes.string,
    height: PropTypes.string,
    controls: PropTypes.bool,
    loop: PropTypes.bool,
    onProgress: PropTypes.func,
    visibilityThreshold: PropTypes.number,
    sx: PropTypes.object,
};

export default VideoPlayer;
