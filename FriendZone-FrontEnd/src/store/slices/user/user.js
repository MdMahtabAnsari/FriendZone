import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";

const initialState = {
    users:{},
}

export const getFilteredUsers = createAsyncThunk(
    '/users/filter',
    async (users) => {
        try{
            const response = await instance.post('/api/users/user/get-filtered',{_id:users});
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const getUserById = createAsyncThunk(
    '/users/get',
    async (userId) => {
        try{
            const response = await instance.get(`/api/users/user/get`,{
                params: {
                    _id: userId
                }
            });
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);

export const getUserByNames = createAsyncThunk(
    '/users/get-by-names',
    async ({name,page,limit}) => {
        try{
            const response = await instance.get(`/api/users/user/get/name`,{
                params: {
                    name,
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

export const updateProfile = createAsyncThunk(
    '/users/update',
    async (data) => {
        try{
            const response = await instance.put('/api/users/user/update',data);
            return response.data;
        }
        catch(error){
            return error.response.data;
        }
    }
);




export const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsers: (state,action) => {
            const user = action.payload;
            state.users[user._id] = user;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getFilteredUsers.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const users = action.payload?.data;
            users?.forEach(user => {
                state.users[user._id] = user;
            });
        });
        builder.addCase(getUserById.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const user = action.payload?.data;
            state.users[user._id] = user;
        });
        builder.addCase(updateProfile.fulfilled,(state,action) => {
            if(!action?.payload?.success) return;
            const user = action.payload?.data;
            state.users[user._id] = user;
        });
    }
});

export const {setUsers} = userSlice.actions;


export default userSlice.reducer;