import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";

const initialState = {
    followerSuggestions: {},
    followers: {},
    followings: {},
    followersCount: {},
    followingCount: {},
    isFollowing: {},
    mutualFollowers: {}
};

export const getFollowerSuggestions = createAsyncThunk(
    '/follower/suggestions',
    async ({ page, limit }) => {
        try {
            const response = await instance.get(`/api/followers/getFollowerSuggestions`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const getFollowersCount = createAsyncThunk(
    '/follower/count',
    async (userId) => {
        try {
            const response = await instance.get(`/api/followers/getFollowersCount/${userId}`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const getFollowers = createAsyncThunk(
    '/followers/get',
    async ({ userId, page, limit }) => {
        try {
            const response = await instance.get(`/api/followers/getFollowers/${userId}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const getFollowingCount = createAsyncThunk(
    '/following/count',
    async (userId) => {
        try {
            const response = await instance.get(`/api/followers/getFollowingCount/${userId}`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const getFollowings = createAsyncThunk(
    '/followings/get',
    async ({ userId, page, limit }) => {
        try {
            const response = await instance.get(`/api/followers/getFollowing/${userId}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const isFollowing = createAsyncThunk(
    '/isFollowing',
    async ({ userId }) => {
        try {
            const response = await instance.get(`/api/followers/isFollowing/${userId}`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const getMutualFollowers = createAsyncThunk(
    '/mutualFollowers',
    async ({ userId, page, limit }) => {
        try {
            const response = await instance.get(`/api/followers/getMutualFollowers/${userId}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const createFollower = createAsyncThunk(
    '/follower/create',
    async ({ followingId }) => {
        try {
            const response = await instance.post(`/api/followers/create`, { followingId });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const deleteFollower = createAsyncThunk(
    '/follower/delete',
    async ({ followingId }) => {
        try {
            const response = await instance.delete(`/api/followers/delete/${followingId}`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

const followerSlice = createSlice({
    name: 'followers',
    initialState,
    reducers: {
        setFollowers: (state, action) => {
            state.followers = action.payload;
        },
        setFollowings: (state, action) => {
            const data = action.payload;
            state.followings = data;
            if(state.followings[data?.followerId]){
                state.followings[data?.followerId][data?.followingId] = data;
            }
        },
        setFollowersCount: (state, action) => {
            const {userId, count} = action.payload;
            state.followersCount[userId] = state.followersCount[userId] ? state.followersCount[userId] + count : count;
        },
        setFollowingCount: (state, action) => {
           const {userId, count} = action.payload;
              state.followingCount[userId] = state.followingCount[userId] ? state.followingCount[userId] + count : count;
        },
        setIsFollowing: (state, action) => {
            state.isFollowing = action.payload;
        },
        removeFollowerSuggestions: (state, action) => {
            delete state.followerSuggestions[action.payload];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFollowerSuggestions.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                data.forEach((follower) => {
                    state.followerSuggestions[follower?._id || follower?.id] = follower;
                });
            })
            .addCase(getFollowers.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                data.forEach((follower) => {
                    if (!state.followers[follower?.followingId]) {
                        state.followers[follower?.followingId] = {};
                    }
                    state.followers[follower?.followingId][follower?.followerId] = follower;
                });
            })
            .addCase(getFollowings.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                data.forEach((follower) => {
                    if (!state.followings[follower?.followerId]) {
                        state.followings[follower?.followerId] = {};
                    }
                    state.followings[follower?.followerId][follower?.followingId] = follower;
                });
            })
            .addCase(getFollowersCount.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                state.followersCount[data?.userId] = data?.count;
            })
            .addCase(getFollowingCount.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                state.followingCount[data?.userId] = data?.count;
            })
            .addCase(isFollowing.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                state.isFollowing[data?.followingId] = data?.isFollowing;
            })
            .addCase(getMutualFollowers.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                const { userId, mutualFollowers } = data;
                mutualFollowers.forEach((follower) => {
                    if (!state.mutualFollowers[userId]) {
                        state.mutualFollowers[userId] = {};
                    }
                    state.mutualFollowers[userId][follower?._id || follower?.id] = follower;
                });
            })
            .addCase(createFollower.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                state.isFollowing[data?.followingId] = true;
                if (state.followersCount[data?.followingId]) {
                    state.followersCount[data?.followingId]++;
                }
                if (state.followingCount[data?.followerId]) {
                    state.followingCount[data?.followerId]++;
                }
                if (!state.followings[data?.followerId]) {
                    state.followings[data?.followerId] = {};
                }
                state.followings[data?.followerId][data?.followingId] = data;
                if (!state.followers[data?.followingId]) {
                    state.followers[data?.followingId] = {};
                }
                state.followers[data?.followingId][data?.followerId] = data;
                if (state.followerSuggestions[data?.followingId]) {
                    delete state.followerSuggestions[data?.followingId];
                }
            })
            .addCase(deleteFollower.fulfilled, (state, action) => {
                if (!action?.payload?.success) return;
                const data = action.payload?.data;
                state.isFollowing[data?.followingId] = false;
                if (state.followersCount[data?.followingId]) {
                    state.followersCount[data?.followingId]--;
                }
                if (state.followingCount[data?.followerId]) {
                    state.followingCount[data?.followerId]--;
                }
                if (state.followings[data?.followerId]) {
                    delete state.followings[data?.followerId][data?.followingId];
                }
                if (state.followers[data?.followingId]) {
                    delete state.followers[data?.followingId][data?.followerId];
                }
            });
    }
});

export const { setFollowers, setFollowings, setFollowersCount, setFollowingCount, setIsFollowing, removeFollowerSuggestions } = followerSlice.actions;

export default followerSlice.reducer;