import { forwardRef, useState, useEffect } from 'react';
import { Image } from 'cloudinary-react';
import PropTypes from 'prop-types';
import { IconButton, Dialog, DialogContent, Box, useTheme } from '@mui/material';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import frontendConfig from '../../configs/frontend-config.js';

const CloudinaryImage = forwardRef(({
                                        publicId,
                                        alt,
                                        width = '300px',
                                        height = '200px',
                                        sx = {},
                                        loading = 'lazy',
                                        onZoomedForDuration, // Callback to parent when zoom is held for 5 seconds
                                    }, ref) => {
    const [open, setOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state
    const [zoomTimer, setZoomTimer] = useState(null); // Track zoom duration
    const theme = useTheme(); // Current theme for styling

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setIsFullscreen(false); // Reset fullscreen state when closing
        clearTimeout(zoomTimer); // Clear timer if image is closed early
        setOpen(false);
    };

    const handleFullscreenToggle = () => {
        const newFullscreenState = !isFullscreen;
        setIsFullscreen(newFullscreenState);

        if (newFullscreenState) {
            const timer = setTimeout(() => {
                if (onZoomedForDuration) {
                    onZoomedForDuration(publicId); // Notify parent component
                }
            }, 5000); // Wait for 5 seconds in zoomed mode
            setZoomTimer(timer);
        } else {
            clearTimeout(zoomTimer); // Clear timer if fullscreen is exited early
        }
    };

    const zoomButtonStyle = {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        color: theme.palette.mode === 'dark' ? 'black' : 'white',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        },
        zIndex: 1, // Ensure the button is on top of the image
    };

    useEffect(() => {
        return () => clearTimeout(zoomTimer); // Cleanup timer on unmount
    }, [zoomTimer]);

    return (
        <Box sx={{ position: 'relative', display: 'inline-block', width, height, ...sx }}>
            {/* Main Image */}
            <Image
                ref={ref}
                cloudName={frontendConfig.CLOUDINARY_CLOUD_NAME}
                publicId={publicId}
                alt={alt}
                width={width}
                height={height}
                style={{ maxWidth: '100%', height: 'auto' }}
                loading={loading}
            />

            {/* Zoom Button */}
            <IconButton
                onClick={handleOpen}
                sx={zoomButtonStyle}
            >
                <ZoomOutMapIcon />
            </IconButton>

            {/* Zoom Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xl"
                fullWidth
                fullScreen={isFullscreen}  // Set fullscreen mode based on state
            >
                <DialogContent sx={{ padding: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                            overflow: 'hidden', // Prevent image from overflowing
                        }}
                    >
                        <Image
                            cloudName={frontendConfig.CLOUDINARY_CLOUD_NAME}
                            publicId={publicId}
                            alt={alt}
                            style={{
                                maxWidth: '100%', // Ensure image stays within viewport
                                maxHeight: '100vh', // Ensure image doesn't overflow vertically
                                height: 'auto',
                                objectFit: 'contain', // Preserve aspect ratio
                            }}
                        />
                    </Box>

                    {/* Fullscreen Toggle Button */}
                    <IconButton
                        onClick={handleFullscreenToggle}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                            color: theme.palette.mode === 'dark' ? 'black' : 'white',
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                            },
                        }}
                    >
                        {isFullscreen ? <ZoomInMapIcon /> : <ZoomOutMapIcon />}
                    </IconButton>
                </DialogContent>
            </Dialog>
        </Box>
    );
});

CloudinaryImage.displayName = 'CloudinaryImage';

// Prop types for documentation and error-checking
CloudinaryImage.propTypes = {
    publicId: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    width: PropTypes.string,
    height: PropTypes.string,
    sx: PropTypes.object,
    loading: PropTypes.oneOf(['auto', 'eager', 'lazy']),
    onZoomedForDuration: PropTypes.func, // Callback for 5-second zoom event
};

export default CloudinaryImage;
