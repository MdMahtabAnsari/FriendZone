import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    WhatsappShareButton,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon,
    WhatsappIcon,
} from 'react-share';

// Map platforms to their corresponding buttons and icons
const platformComponents = {
    facebook: { Button: FacebookShareButton, Icon: FacebookIcon },
    twitter: { Button: TwitterShareButton, Icon: TwitterIcon },
    linkedin: { Button: LinkedinShareButton, Icon: LinkedinIcon },
    whatsapp: { Button: WhatsappShareButton, Icon: WhatsappIcon },
};

const CustomShareDialog = ({ open, onClose, title, shareUrl, platforms }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {platforms?.map((platform) => {
                        const Platform = platformComponents[platform];
                        if (!Platform) return null;

                        const { Button: ShareButton, Icon: ShareIcon } = Platform;
                        return (
                            <ShareButton key={platform} url={shareUrl}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'action.hover' },
                                    }}
                                >
                                    <ShareIcon size={32} round />
                                    <span>Share on {platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                                </Box>
                            </ShareButton>
                        );
                    })}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

CustomShareDialog.propTypes = {
    open: PropTypes.bool.isRequired, // Open state of the dialog
    onClose: PropTypes.func.isRequired, // Function to call on close
    title: PropTypes.string.isRequired, // Title of the dialog
    shareUrl: PropTypes.string.isRequired, // URL to share
    platforms: PropTypes.arrayOf(PropTypes.string).isRequired, // List of platforms to share on
};

export default CustomShareDialog;
