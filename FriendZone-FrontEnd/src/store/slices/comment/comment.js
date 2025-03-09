import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from "../../../apis/axios.js";

const initialState = {
    comments: {},
    replies: {},
    rootComments: {},
    commentCount: {}
};

export const commentCount = createAsyncThunk(
    '/comments/count',
    async (postId) => {
        try {
            const response = await instance.get(`/api/comments/count/post/${postId}`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const fetchComments = createAsyncThunk(
    '/comments/get',
    async ({ postId, parentCommentId ,page, limit }) => {
        try {
            const response = await instance.get(`/api/comments/post/${postId}/comment/${parentCommentId ? parentCommentId : ":parentCommentId"}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const getCommentById = createAsyncThunk(
    '/comments/get/id',
    async (commentId) => {
        try {
            const response = await instance.get(`/api/comments/get/${commentId}`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const updateComment = createAsyncThunk(
    '/comments/update',
    async ({ commentId, comment }) => {
        try {
            const response = await instance.put(`/api/comments/update`, { commentId, comment });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const deleteComment = createAsyncThunk(
    '/comments/delete',
    async (commentId) => {
        try {
            const response = await instance.delete(`/api/comments/delete/${commentId}`);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const createComment = createAsyncThunk(
    '/comments/create',
    async ({ postId, comment, parentCommentId }) => {
        try {
            const response = await instance.post(`/api/comments/create`, { postId, comment, parentCommentId });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
);

export const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        setComments: (state, action) => {
            state.comments = action.payload;
        },
        setCommentCount: (state, action) => {
            const data = action.payload;
            state.commentCount[data.postId] = data.count;
        },
        incrementCommentCount: (state, action) => {
            state.commentCount[action.payload.postId]++;
        },
        decrementCommentCount: (state, action) => {
            state.commentCount[action.payload.postId]--;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(commentCount.fulfilled, (state, action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            state.commentCount[data?.postId] = data.count;
        });
        builder.addCase(fetchComments.fulfilled, (state, action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            data?.forEach(comment => {
                state.comments[comment._id] = comment;
                if (!comment?.parentCommentId) {
                    if (!state.rootComments[comment.postId]) {
                        state.rootComments[comment.postId] = {};
                    }
                    state.rootComments[comment.postId][comment._id] = comment;
                } else {
                    if (!state.replies[comment.parentCommentId]) {
                        state.replies[comment.parentCommentId] = {};
                    }
                    state.replies[comment.parentCommentId][comment._id] = comment;
                }
            });
        });
        builder.addCase(getCommentById.fulfilled, (state, action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            if (!data?.parentCommentId) {
                if (!state.rootComments[data.postId]) {
                    state.rootComments[data.postId] = {};
                }
                state.rootComments[data.postId][data._id] = data;
            } else {
                if (!state.replies[data.parentCommentId]) {
                    state.replies[data.parentCommentId] = {};
                }
                state.replies[data.parentCommentId][data._id] = data;
            }
            state.comments[data._id] = data;
        });
        builder.addCase(updateComment.fulfilled, (state, action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            state.comments[data._id] = data;
            if (!data?.parentCommentId) {
                state.rootComments[data.postId][data._id] = data;
            } else {
                state.replies[data.parentCommentId][data._id] = data;
            }
        });
        builder.addCase(deleteComment.fulfilled, (state, action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            if (!data?.parentCommentId) {
                delete state.rootComments[data.postId][data._id];
            } else {
                delete state.replies[data.parentCommentId][data._id];
                const parentComment = state.comments[data.parentCommentId];
                if (!parentComment?.parentCommentId) {
                    state.rootComments[parentComment.postId][parentComment._id].replies = parentComment.replies.filter(reply => reply !== data._id);
                } else {
                    state.replies[parentComment.parentCommentId][parentComment._id].replies = parentComment.replies.filter(reply => reply !== data._id);
                }
            }
            delete state.comments[data._id];
            state.commentCount[data.postId]--;
        });
        builder.addCase(createComment.fulfilled, (state, action) => {
            if(!action?.payload?.success) return;
            const data = action.payload?.data;
            if (!data?.parentCommentId) {
                state.rootComments[data.postId][data._id] = data;
            } else {
                if (!state.replies[data.parentCommentId]) {
                    state.replies[data.parentCommentId] = {};
                }
                state.replies[data.parentCommentId][data._id] = data;
                const parentComment = state.comments[data.parentCommentId];
                if (!parentComment?.parentCommentId) {
                    state.rootComments[parentComment.postId][parentComment._id].replies.push(data._id);
                } else {
                    state.replies[parentComment.parentCommentId][parentComment._id].replies.push(data._id);
                }
            }
            state.comments[data._id] = data;
            state.commentCount[data.postId]++;
        });
    }
});

export const { setComments, setCommentCount, incrementCommentCount, decrementCommentCount } = commentSlice.actions;
export default commentSlice.reducer;