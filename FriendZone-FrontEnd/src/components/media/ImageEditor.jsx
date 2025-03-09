import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import { PinturaEditor } from '@pqina/react-pintura';
import '@pqina/pintura/pintura.css';
import { getEditorDefaults } from '@pqina/pintura';

const editorDefaults = getEditorDefaults({
    stickers: ['😎', '🤣', '🤔', '🤩', '🤯', '🤪', '🤫', '🤭', '🧐', '🧑‍🎨'],
});

const ImageEditor = ({ file, onEditComplete, onEditCancel }) => {
    const [result, setResult] = useState('');

    const handleProcess = ({ dest }) => {
        const editedFile = new File([dest], file.name, { type: file.type });
        setResult(URL.createObjectURL(dest));
        onEditComplete(editedFile);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Edit Image</Typography>
            <Box sx={{ height: '70vh', width: '100%' }}>
                <PinturaEditor
                    {...editorDefaults}
                    src={URL.createObjectURL(file)}
                    imageCropAspectRatio={1}
                    onLoad={(res) => console.log('load image', res)}
                    onProcess={handleProcess}
                />
            </Box>
            <Button variant="contained" color="secondary" onClick={onEditCancel} sx={{ mt: 2 }}>
                Cancel
            </Button>
            {!!result.length && (
                <Box sx={{ mt: 2 }}>
                    <img src={result} alt="Edited" style={{ maxWidth: '100%' }} />
                </Box>
            )}
        </Box>
    );
};

ImageEditor.propTypes = {
    file: PropTypes.object.isRequired,
    onEditComplete: PropTypes.func.isRequired,
    onEditCancel: PropTypes.func.isRequired,
};

export default ImageEditor;