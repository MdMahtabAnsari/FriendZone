import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography, Modal } from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageEditor from './ImageEditor';

const FileInput = styled('input')({
    display: 'none',
});

const MediaInput = ({ onChange, label, accept = 'image/*,video/*', maxSize = 5000000 }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        // Validate file type and size
        if (selectedFile && selectedFile.size > maxSize) {
            setError(`File size should not exceed ${maxSize / 1000000}MB.`);
            return;
        }

        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError('');
            onChange(selectedFile);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setPreviewUrl(null);
        setError('');
        onChange(null);
    };

    const handleEditComplete = (editedFile) => {
        setFile(editedFile);
        setPreviewUrl(URL.createObjectURL(editedFile));
        setIsEditing(false);
        onChange(editedFile);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {label && <Typography variant="subtitle1">{label}</Typography>}

            <label htmlFor="media-input">
                <FileInput
                    id="media-input"
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                />
                <IconButton color="primary" aria-label="upload media" component="span">
                    <PhotoCamera fontSize="large" />
                </IconButton>
            </label>

            {previewUrl && (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    {file.type.startsWith('image') ? (
                        <img src={previewUrl} alt="preview" style={{ width: '100%', borderRadius: '8px' }} />
                    ) : (
                        <video src={previewUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
                    )}
                    <IconButton
                        onClick={handleRemove}
                        sx={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                        <CancelIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => setIsEditing(true)}
                        sx={{ position: 'absolute', top: 8, right: 48, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Box>
            )}


            {error && <Typography color="error" variant="caption">{error}</Typography>}

            <Modal
                open={isEditing}
                onClose={handleEditCancel}
                aria-labelledby="edit-image-modal"
                aria-describedby="edit-image-modal-description"
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Box sx={{ width: '80%', bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
                        <ImageEditor
                            file={file}
                            onEditComplete={handleEditComplete}
                            onEditCancel={handleEditCancel}
                        />
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

// Prop types for error-checking
MediaInput.propTypes = {
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    accept: PropTypes.string,
    maxSize: PropTypes.number,
};

export default MediaInput;