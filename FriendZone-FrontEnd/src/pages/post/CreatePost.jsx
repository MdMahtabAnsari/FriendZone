import {useCallback, useState} from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography, CircularProgress } from '@mui/material';
import { CustomInput, CustomButton, MultiMediaInput } from '../../components';
import { createPost } from "../../store/slices/post/post";
import { useDispatch } from "react-redux";

const CreatePostForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [mediaFiles, setMediaFiles] = useState([]);
    const [progress, setProgress] = useState(false);
    const [error, setError] = useState(null);
    const [content, setContent] = useState('');
    const [success, setSuccess] = useState(false);
    const dispatch = useDispatch();
   

    const onSubmit = useCallback(async (data) => {
        const tags = extractHashtags(data.content);
        const formData = new FormData();
        formData.append('content', data.content);
        tags?.forEach((tag) => {
            formData.append('tags', tag);
        });
        mediaFiles.forEach((file) => {
            formData.append(`media`, file);
        });

        setProgress(true);
        setSuccess(false)
        const response = await dispatch(createPost(formData));
        if(response?.payload?.success){
            setSuccess(true);
        }
        else {
            setError(response?.payload?.message);
        }
        setProgress(false);

    },[mediaFiles, dispatch]);

    const handleMediaChange = (files) => {
        setMediaFiles(files);
    };

    const handleContentChange = (event) => {
        const value = event.target.value;
        setContent(value);
    };

    const highlightTags = (text) => {
        return text.replace(/#(\w+)/g, '<span style="color: var(--tag-color);">#$1</span>');
    };

    const extractHashtags = (text) => {
        const regex = /#(\w+)/g;
        const matches = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1]); // Add only the tag without the #
        }
        return matches;
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600, margin: '20px auto 0', border: '1px solid #ccc', borderRadius: '8px', padding: 2, wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
            <Typography variant="h4">Create Post</Typography>
            <CustomInput
                label="Content"
                {...register('content', { required: 'Content is required' })}
                error={!!errors.content}
                helperText={errors.content?.message}
                onChange={handleContentChange}
                value={content}
            />
            <div dangerouslySetInnerHTML={{ __html: highlightTags(content) }} />
            <MultiMediaInput onChange={handleMediaChange} />
            {progress && <CircularProgress color="inherit" sx={{ margin: '20px auto' }} />}
            {error && (
                <Typography
                    variant="body1"
                    color="error"
                    sx={{
                        marginTop: 2,
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}
                >
                    {error}
                </Typography>
            )}
            {success && (
                <Typography
                    variant="body1"
                    color="success"
                    sx={{
                        marginTop: 2,
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}
                >
                    Post created successfully
                </Typography>
            )}
            <CustomButton text="Create Post" type="submit" />
        </Box>
    );
};

export default CreatePostForm;