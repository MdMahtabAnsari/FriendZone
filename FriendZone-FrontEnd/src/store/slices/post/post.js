import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";

const initialState = {
    posts:{},
    userPosts:{},
    userPostCount:{},
}

export const recommendedPosts = createAsyncThunk(
    '/posts/recommended',
    async ({page,limit}) => {
        try{
            const response = await instance.get('/api/posts/recommendations/get',{
                params:{
                    page,
                    limit
                }
            });
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const randomPosts = createAsyncThunk(
    '/posts/random',
    async () => {
        try{
            const response = await instance.get('api/posts/random');
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const createPost = createAsyncThunk(
    '/posts/create',
    async (data) => {
        try{
            const response = await instance.post('/api/posts/create',data);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const userPosts = createAsyncThunk(
    '/posts/user',
    async ({userId,page,limit}) => {
        try{
            const response = await instance.get(`/api/posts/user/${userId}`,{
                params:{
                    page,
                    limit
                }
            });
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);
export const fetchPostById = createAsyncThunk(
    '/posts/fetchById',
    async (postId) => {
        try {
            const response = await instance.get(`/api/posts/${postId}`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const deletePost = createAsyncThunk(
    '/posts/delete',
    async (postId) => {
        try{
            const response = await instance.delete(`/api/posts/delete/${postId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const getUserPostCount = createAsyncThunk(
    '/posts/userPostCount',
    async (userId) => {
        try{
            const response = await instance.get(`/api/posts/get/user/posts/count/${userId}`);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);


export const getPostByContent = createAsyncThunk(
    '/posts/getByContent',
    async ({content,page,limit}) => {
        try{
            const response = await instance.get(`/api/posts/content/get`,{
                params:{
                    content,
                    page,
                    limit
                }
            });
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const getPostByTag = createAsyncThunk(
    '/posts/getByTag',
    async ({tags,page,limit}) => {
        try{
            const response = await instance.get(`/api/posts/tags/get`,{
                params:{
                    tags,
                    page,
                    limit
                }
            });
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const updatePost = createAsyncThunk(
    '/posts/update',
    async (data) => {
        try{
            const response = await instance.put(`/api/posts/update`,data);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    });


export const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setPosts: (state,action) => {
            state.posts = action.payload;
        },
        updateUserPost: (state,action) => {
            const post = action.payload;
            if(!state.userPosts[post?.userId]) {
                state.userPosts[post?.userId]={}
            }
            state.userPosts[post?.userId][post?._id] = post;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(recommendedPosts.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const posts = action.payload?.data;
            posts?.forEach(post => {
                state.posts[post.id] = post;
            });
        });
        builder.addCase(randomPosts.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const posts = action.payload?.data;
            posts?.forEach(post => {
                state.posts[post?._id] = post;
            });
        });
        builder.addCase(createPost.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const post = action.payload?.data;
            if(!state.userPosts[post?.userId]) {
                state.userPosts[post?.userId]={}
            }
              state.userPosts[post?.userId][post?._id] = post;

        });
        builder.addCase(userPosts.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const posts = action.payload?.data;
            posts?.forEach(post => {
                if(!state.userPosts[post?.userId]) {
                    state.userPosts[post?.userId]={}
                }
                state.userPosts[post?.userId][post?._id] = post;
            });
        });
        builder.addCase(fetchPostById.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const post = action.payload?.data;
            state.posts[post?._id] = post;
        });
        builder.addCase(deletePost.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const {_id,userId} = action.payload?.data;
            delete state.userPosts[userId][_id];

        });
        builder.addCase(getUserPostCount.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const {userId,count} = action.payload?.data;
            state.userPostCount[userId] = count;
        });
        builder.addCase(updatePost.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const post = action.payload?.data;
            if(!state.userPosts[post?.userId]) {
                state.userPosts[post?.userId]={}
            }
            state.userPosts[post?.userId][post?._id] = post;
        });
    }
});

export const { setPosts,updateUserPost } = postSlice.actions;

export default postSlice.reducer;