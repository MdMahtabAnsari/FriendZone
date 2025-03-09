import React, { useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography, CircularProgress } from '@mui/material';
import { CustomInput, CustomButton, MultiMediaInput } from '../../components';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPostById,updatePost } from "../../store/slices/post/post";
import { useDispatch, useSelector } from "react-redux";
import routesConfig from "../../routes/routes.js";

const UpdatePostForm = () => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [mediaFiles, setMediaFiles] = useState([]);
    const[imageUrls,setImageUrls] = useState([]);
    const[videoUrls,setVideoUrls] = useState([]);
    const [progress, setProgress] = useState(false);
    const [error, setError] = useState(null);
    const [content, setContent] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { postId } = useParams();
    const { user } = useSelector((state) => state.auth);
    const { userPosts } = useSelector((state) => state.posts);


    const fetchPost = useCallback(async()=>{
        if(userPosts[postId]){
            const postData =userPosts[postId];
            if(!user || postData?.userId !== user?._id){
                navigate(routesConfig.home);
                return;
            }
            setValue('content', postData.content);
            setContent(postData.content);
            setImageUrls(() => [...postData.images]);
            setVideoUrls(() => [...postData.videos]);
            return;
        }
        const response = await dispatch(fetchPostById(postId));
        if(response?.payload?.success){
            const postData = response.payload.data;
            if(!user || postData?.userId !== user?._id){
                navigate(routesConfig.home);
                return;
            }
            setValue('content', postData.content);
            setContent(postData.content);
            setImageUrls(() => [...postData.images]);
            setVideoUrls(() => [...postData.videos]);
        }else{
            setError(response?.payload?.message);
        }
    },[userPosts, postId, dispatch, user, setValue, navigate] )

    useEffect(() => {
        fetchPost();
    }, [dispatch, fetchPost, postId, setValue]);

    const onSubmit = useCallback(async (data) => {
        const tags = extractHashtags(data.content);
        const formData = new FormData();
        formData.append('content', data.content);
        tags?.forEach((tag) => {
            formData.append('tags', tag);
        });
        mediaFiles?.forEach((file) => {
            formData.append('media', file);
        });
        imageUrls?.forEach((url) => {
            formData.append('images', url);
        });
        videoUrls?.forEach((url) => {
            formData.append('videos', url);
        });
        formData.append('postId', postId);

        setError(null);
        setProgress(true);
        const response = await dispatch(updatePost(formData));
        if (response?.payload?.success) {
            navigate(routesConfig.home);
        } else {
            setError(response?.payload?.message);
        }

        setProgress(false);

    }, [mediaFiles, imageUrls, videoUrls, postId, dispatch, navigate]);

    const handleMediaChange = (files) => {
        setMediaFiles(files);

    }
    const handleImageUrlChange = (urls) => {
        setImageUrls(urls);
    }

    const handleVideoUrlChange = (urls) => {
        setVideoUrls(urls);
    }

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
            <Typography variant="h4">Update Post</Typography>
            <CustomInput
                label="Content"
                {...register('content', { required: 'Content is required' })}
                error={!!errors.content}
                helperText={errors.content?.message}
                onChange={handleContentChange}
                value={content}
            />
            <div dangerouslySetInnerHTML={{ __html: highlightTags(content) }} />
            <MultiMediaInput onChange={handleMediaChange} initialFiles={mediaFiles} videosUrl={videoUrls} imagesUrl={imageUrls} onImageUrlChange={handleImageUrlChange} onVideoUrlChange={handleVideoUrlChange}/>
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
            <CustomButton text="Update Post" type="submit" />
        </Box>
    );
};

export default UpdatePostForm;