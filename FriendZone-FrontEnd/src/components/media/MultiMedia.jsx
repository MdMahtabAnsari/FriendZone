import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography, Modal } from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import ImageEditor from './ImageEditor';

const FileInput = styled('input')({
    display: 'none',
});

const MediaInput = ({ onChange, onImageUrlChange, onVideoUrlChange, label, accept = 'image/jpeg,image/png,image/jpg,video/mp4', maxImageSize = 10000000, maxVideoSize = 100000000, imagesUrl = [], videosUrl = [] }) => {
    const [files, setFiles] = useState([]);
    const [imageUrlsPrev, setImageUrlsPrev] = useState([]);
    const [videoUrlsPrev, setVideoUrlsPrev] = useState([]);
    const [previewFileUrls, setPreviewFileUrls] = useState([]);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingFileIndex, setEditingFileIndex] = useState(null);

    useEffect(() => {
        if (JSON.stringify(imagesUrl) !== JSON.stringify(imageUrlsPrev)) {
            setImageUrlsPrev([...imagesUrl]);
        }
        if (JSON.stringify(videosUrl) !== JSON.stringify(videoUrlsPrev)) {
            setVideoUrlsPrev([...videosUrl]);
        }
    }, [imagesUrl, videosUrl, imageUrlsPrev, videoUrlsPrev]);

    const handleFileChange = useCallback((event) => {
        const selectedFiles = Array.from(event.target.files);
        const validFiles = [];
        const validPreviewUrls = [];

        if (files.length + selectedFiles.length > 10) {
            setError('You can upload a maximum of 10 files.');
            return;
        }

        selectedFiles.forEach((file) => {
            const isImage = file.type.startsWith('image');
            const isVideo = file.type.startsWith('video');
            const maxSize = isImage ? maxImageSize : maxVideoSize;

            if ((isImage || isVideo) && file.size <= maxSize) {
                validFiles.push(file);
                validPreviewUrls.push(URL.createObjectURL(file));
            } else {
                setError(`File size should not exceed ${maxSize / 1000000}MB and must be in the format ${accept}.`);
            }
        });

        setFiles((prevFiles) => [...prevFiles, ...validFiles]);
        setPreviewFileUrls((prevUrls) => [...prevUrls, ...validPreviewUrls]);
        setError('');
        onChange([...files, ...validFiles]);
    }, [accept, files, maxImageSize, maxVideoSize, onChange]);

    const handleFileRemove = useCallback((index) => {
        const newFiles = [...files];
        const newPreviewUrls = [...previewFileUrls];
        newFiles.splice(index, 1);
        newPreviewUrls.splice(index, 1);
        setFiles(newFiles);
        setPreviewFileUrls(newPreviewUrls);
        onChange(newFiles);
    }, [files, onChange, previewFileUrls]);

    const handleImageUrlRemove = useCallback((index) => {
        const newImageUrls = [...imageUrlsPrev];
        newImageUrls.splice(index, 1);
        setImageUrlsPrev(newImageUrls);
        onImageUrlChange(newImageUrls);
    }, [imageUrlsPrev, onImageUrlChange]);

    const handleVideoUrlRemove = useCallback((index) => {
        const newVideoUrls = [...videoUrlsPrev];
        newVideoUrls.splice(index, 1);
        setVideoUrlsPrev(newVideoUrls);
        onVideoUrlChange(newVideoUrls);
    }, [onVideoUrlChange, videoUrlsPrev]);

    const handleEditComplete = (editedFile) => {
        const newFiles = [...files];
        newFiles[editingFileIndex] = editedFile;
        setFiles(newFiles);
        setPreviewFileUrls((prevUrls) => {
            const newUrls = [...prevUrls];
            newUrls[editingFileIndex] = URL.createObjectURL(editedFile);
            return newUrls;
        });
        setIsEditing(false);
        onChange(newFiles);
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
                    multiple
                    onChange={handleFileChange}
                />
                <IconButton color="primary" aria-label="upload media" component="span">
                    <PhotoCamera fontSize="large" />
                </IconButton>
            </label>

            {imageUrlsPrev?.map((url, index) => (
                <Box key={index} sx={{ position: 'relative', width: '100%', maxWidth: '300px', marginBottom: 2 }}>
                    <img src={url} alt="preview" style={{ width: '100%', borderRadius: '8px' }} />
                    <IconButton
                        onClick={() => handleImageUrlRemove(index)}
                        sx={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                        <CancelIcon />
                    </IconButton>
                </Box>
            ))}
            {videoUrlsPrev?.map((url, index) => (
                <Box key={index} sx={{ position: 'relative', width: '100%', maxWidth: '300px', marginBottom: 2 }}>
                    <video src={url} controls style={{ width: '100%', borderRadius: '8px' }} />
                    <IconButton
                        onClick={() => handleVideoUrlRemove(index)}
                        sx={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                        <CancelIcon />
                    </IconButton>
                </Box>
            ))}
            {previewFileUrls?.map((url, index) => (
                <Box key={index} sx={{ position: 'relative', width: '100%', maxWidth: '300px', marginBottom: 2 }}>
                    {files[index]?.type.startsWith('image') ? (
                        <img src={url} alt="preview" style={{ width: '100%', borderRadius: '8px' }} />
                    ) : (
                        <video src={url} controls style={{ width: '100%', borderRadius: '8px' }} />
                    )}
                    <IconButton
                        onClick={() => handleFileRemove(index)}
                        sx={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                        <CancelIcon />
                    </IconButton>
                    {files[index]?.type.startsWith('image') && (
                        <IconButton
                            onClick={() => {
                                setEditingFileIndex(index);
                                setIsEditing(true);
                            }}
                            sx={{ position: 'absolute', top: 8, right: 48, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                </Box>
            ))}

            {error && <Typography color="error" variant="caption">{error}</Typography>}

            <Modal
                open={isEditing}
                onClose={handleEditCancel}
                aria-labelledby="edit-image-modal"
                aria-describedby="edit-image-modal-description"
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Box sx={{ width: '80%', bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
                        {editingFileIndex !== null && files[editingFileIndex] && (
                            <ImageEditor
                                file={files[editingFileIndex]}
                                onEditComplete={handleEditComplete}
                                onEditCancel={handleEditCancel}
                            />
                        )}
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
    maxImageSize: PropTypes.number,
    maxVideoSize: PropTypes.number,
    imagesUrl: PropTypes.arrayOf(PropTypes.string),
    videosUrl: PropTypes.arrayOf(PropTypes.string),
    onImageUrlChange: PropTypes.func,
    onVideoUrlChange: PropTypes.func,
};

export default MediaInput;