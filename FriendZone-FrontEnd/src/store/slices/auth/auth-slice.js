import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";


const initialState = {
    user: null

};

export const signupUser = createAsyncThunk(
    '/auth/signup',
    async (data) => {
        try{
            const response = await instance.post('/api/users/auth/signup',data);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const loginUser = createAsyncThunk(
    '/auth/login',
    async (data) => {
        try{
            const response = await instance.post('/api/users/auth/login',data);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const refreshToken = createAsyncThunk(
    '/auth/refresh',
    async () => {
        try{
            const response = await instance.post('/api/users/token/refresh');
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const logoutUser = createAsyncThunk(
    '/auth/logout',
    async () => {
        try{
            const response = await instance.delete('/api/users/auth/logout');
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const sendOtp = createAsyncThunk(
    '/auth/sendOtp',
    async (email) => {
        try{
            const response = await instance.post('/api/users/otp/create',{email:email});
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const verifyOtp = createAsyncThunk(
    '/auth/verifyOtp',
    async ({email,otp}) => {
        try{
            const response = await instance.post('/api/users/otp/verify',{email,otp});
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const resetPassword = createAsyncThunk(
    '/auth/resetPassword',
    async (password) => {
        try{
            const response = await instance.put('/api/users/user/update',{password:password});
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state,action) => {
            state.user = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.fulfilled,(state,action) => {
            if(action.payload?.success){
                state.user = action.payload?.data;
            }

        });
        builder.addCase(refreshToken.fulfilled,(state,action) => {
            if(action.payload?.success){
                state.user = action.payload?.data;
            }

        });
        builder.addCase(logoutUser.fulfilled,(state,action) => {
            if(action.payload?.success){
                state.user = null;
            }
        });
    }

});

export const { setUser } = authSlice.actions;

export default authSlice.reducer;
