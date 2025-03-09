import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";

const initialState = {
    likeCount:{},
    dislikeCount:{},
    likeAndDislikeStatus:{}
}


export const postLikeCount = createAsyncThunk(
    '/posts/like',
    async (postId) => {
        try{
            const response = await instance.get(`/api/likes/posts/get/likes/count/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const postDislikeCount = createAsyncThunk(
    '/posts/dislike',
    async (postId) => {
        try{
            const response = await instance.get(`/api/likes/posts/get/dislikes/count/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const postLikeAndDislikeStatus = createAsyncThunk(
    '/posts/like/dislike/status',
    async (postId) => {
        try{
            const response = await instance.get(`/api/likes/posts/get/likeAndDislike/status/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const likePost = createAsyncThunk(
    '/posts/like',
    async (postId) => {
        try{
            const response = await instance.post(`/api/likes/posts/like/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const dislikePost = createAsyncThunk(
    '/posts/dislike',
    async (postId) => {
        try{
            const response = await instance.post(`/api/likes/posts/dislike/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const removeLike = createAsyncThunk(
    '/posts/like/remove',
    async (postId) => {
        try{
            const response = await instance.delete(`/api/likes/posts/remove/like/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const removeDislike = createAsyncThunk(
    '/posts/dislike/remove',
    async (postId) => {
        try{
            const response = await instance.delete(`/api/likes/posts/remove/dislike/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);


export const likeSlice = createSlice({
    name: 'postLikes',
    initialState,
    reducers: {
        setLikeCount: (state,action) => {
           const data = action.payload;
              state.likeCount[data?.postId] = data?.likes;
        },
        setDislikeCount: (state,action) => {
            const data = action.payload;
            state.dislikeCount[data?.postId] = data?.dislikes;
        },
        setPostLikeAndDislikeStatus: (state,action) => {
            const data = action.payload;
            state.likeAndDislikeStatus[data?.postId] = data;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(postLikeCount.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            state.likeCount[data?.postId] = data.likes;
        });
        builder.addCase(postDislikeCount.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            state.dislikeCount[data?.postId] = data.dislikes;
        });
        builder.addCase(postLikeAndDislikeStatus.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            if(data){
                state.likeAndDislikeStatus[data?.postId] = data;
            }
        });
    }
});


export const {setLikeCount,setDislikeCount,setPostLikeAndDislikeStatus} = likeSlice.actions;

export default likeSlice.reducer;

