import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";

const initialState = {
    viewCount:{},
}

export const postViewCount = createAsyncThunk(
    '/posts/view',
    async (postId) => {
        try{
            const response = await instance.get(`/api/views/view/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const createPostView = createAsyncThunk(
    '/posts/view',
    async (postId) => {
        try{
            const response = await instance.post(`/api/views/view/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const viewSlice = createSlice({
    name: 'postViews',
    initialState,
    reducers: {
        setViewCount: (state,action) => {
            const data = action.payload;
            state.viewCount[data?.postId] = data?.views;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(postViewCount.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const {postId,views} = action?.payload?.data;
            state.viewCount[postId] = views;
        });
    }
});


export const {setViewCount} = viewSlice.actions;


export default viewSlice.reducer;