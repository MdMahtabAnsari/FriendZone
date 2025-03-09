import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";

const initialState = {
    likeCount:{},
    dislikeCount:{},
    likeAndDislikeStatus:{}
}

export const commentLikeCount = createAsyncThunk(
    '/comments/like',
    async (commentId) => {
        try{
            const response = await instance.get(`/api/likes/comments/get/likes/count/${commentId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const commentDislikeCount = createAsyncThunk(
    '/comments/dislike',
    async (commentId) => {
        try{
            const response = await instance.get(`/api/likes/comments/get/dislikes/count/${commentId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const commentLikeAndDislikeStatus = createAsyncThunk(
    '/comments/like/dislike/status',
    async (commentId) => {
        try{
            const response = await instance.get(`/api/likes/comments/get/likeAndDislike/status/${commentId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const likeComment = createAsyncThunk(
    '/comments/like',
    async (commentId) => {
        try{
            const response = await instance.post(`/api/likes/comments/like/${commentId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const dislikeComment = createAsyncThunk(
    '/comments/dislike',
    async (commentId) => {
        try{
            const response = await instance.post(`/api/likes/comments/dislike/${commentId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const removeCommentLike = createAsyncThunk(
    '/comments/remove/like',
    async (commentId) => {
        try{
            const response = await instance.delete(`/api/likes/comments/remove/like/${commentId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const removeCommentDislike = createAsyncThunk(
    '/comments/remove/dislike',
    async (commentId) => {
        try{
            const response = await instance.delete(`/api/likes/comments/remove/dislike/${commentId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);


export const commentLikeSlice = createSlice({
    name: 'commentLikes',
    initialState,
    reducers: {
        setCommentLikeCount: (state,action) => {
            const data = action.payload;
            state.likeCount[data.commentId] = data.likes;
        },
        setCommentDislikeCount: (state,action) => {
            const data = action.payload;
            state.dislikeCount[data.commentId] = data.dislikes;
        },
        setCommentLikeAndDislikeStatus: (state,action) => {
            const data = action.payload;
            state.likeAndDislikeStatus[data.commentId] = data;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(commentLikeCount.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            state.likeCount[data?.commentId] = data.likes
        });
        builder.addCase(commentDislikeCount.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            state.dislikeCount[data?.commentId] = data.dislikes
        });
        builder.addCase(commentLikeAndDislikeStatus.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
           if(data){
               state.likeAndDislikeStatus[data.commentId] = data;
           }
        });
    }
});

export const {setCommentLikeCount,setCommentDislikeCount,setCommentLikeAndDislikeStatus} = commentLikeSlice.actions;

export default commentLikeSlice.reducer;