import React, { useState } from 'react';
import { Box, Avatar, TextField, IconButton, InputAdornment } from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import { Send } from '@mui/icons-material';

const CustomCommentInput = ({ onSubmit, currentUser, postId, parentCommentId }) => {
    const [text, setText] = useState('');
    const { user } = useSelector((state) => state?.auth);

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit({ comment: text, postId, parentCommentId });
            setText(''); // Clear the input
        }
    };

    return (
        <Box display="flex" alignItems="center" gap={2} sx={{ p: 1, width: '100%', maxWidth: 600 }}>
            {/* User Avatar */}
            <Avatar src={user?.image} alt={user?.name} />
            {/*Mention*/}
            {currentUser ? (
                <TextField
                    variant="outlined"
                    placeholder={`Replying to ${currentUser?.name}`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={!text.trim()}
                                        edge="end"
                                    >
                                        <Send />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            ):
            ( <TextField
                fullWidth
                variant="outlined"
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    color="primary"
                                    onClick={handleSubmit}
                                    disabled={!text.trim()}
                                    edge="end"
                                >
                                    <Send />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />)}
        </Box>
    );
};

CustomCommentInput.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    currentUser: PropTypes.object,
    postId: PropTypes.string.isRequired,
    parentCommentId: PropTypes.string,
};

export default CustomCommentInput;
