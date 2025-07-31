import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async thunks
export const getComments = createAsyncThunk(
  'comments/getComments',
  async ({ resourceType, resourceId }) => {
    let url;
    if (resourceType === 'project') {
      url = `/projects/${resourceId}/comments`;
    } else if (resourceType === 'task') {
      url = `/tasks/${resourceId}/comments`;
    } else {
      throw new Error('Invalid resourceType for comments');
    }
    const getResponse = await api.get(url);
    return { resourceType, resourceId, comments: getResponse.data };
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ resourceType, resourceId, content, replyTo, files }) => {
    const urlType = resourceType === 'task' ? 'tasks' : 'projects';
    let createResponse;
    if (files instanceof FormData) {
      // Handle file upload with FormData
      if (!files.has('content')) files.append('content', content);
      if (!files.has('entityId')) files.append('entityId', String(resourceId));
      if (!files.has('entityType')) files.append('entityType', resourceType);
      if (replyTo && !files.has('replyTo')) files.append('replyTo', String(replyTo));
      createResponse = await api.post(`/${urlType}/${resourceId}/comments`, files, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Handle regular comment without files
      const payload = {
        content,
        entityId: String(resourceId),
        entityType: resourceType
      };
      if (replyTo) payload.replyTo = String(replyTo);
      createResponse = await api.post(`/${urlType}/${resourceId}/comments`, payload);
    }
    // Return only the comment object from the backend
    return createResponse.data;
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ resourceType, resourceId, commentId, content }) => {
    const urlType = resourceType === 'task' ? 'tasks' : 'projects';
    const updateResponse = await api.put(`/${urlType}/${resourceId}/comments/${commentId}`, {
      content
    });
    return updateResponse.data;
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ resourceType, resourceId, commentId }) => {
    const urlType = resourceType === 'task' ? 'tasks' : 'projects';
    await api.delete(`/${urlType}/${resourceId}/comments/${commentId}`);
    return { commentId, resourceType, resourceId };
  }
);

export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async ({ resourceType, resourceId, commentId }) => {
    const urlType = resourceType === 'task' ? 'tasks' : 'projects';
    await api.post(`/${urlType}/${resourceId}/comments/${commentId}/like`);
    return { commentId, liked: true };
  }
);

export const unlikeComment = createAsyncThunk(
  'comments/unlikeComment',
  async ({ resourceType, resourceId, commentId }) => {
    const urlType = resourceType === 'task' ? 'tasks' : 'projects';
    await api.delete(`/${urlType}/${resourceId}/comments/${commentId}/like`);
    return { commentId, liked: false };
  }
);

// Helper to normalize IDs to strings recursively
function normalizeCommentIds(comments) {
  return comments.map(comment => ({
    ...comment,
    _id: comment._id ? String(comment._id) : undefined,
    replyTo: comment.replyTo !== undefined ? String(comment.replyTo) : undefined,
    author: comment.author ? {
      ...comment.author,
      _id: comment.author._id ? String(comment.author._id) : undefined
    } : undefined,
    attachments: comment.attachments || [],
    replies: comment.replies ? normalizeCommentIds(comment.replies) : []
  }));
}

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: {
      project: {},
      task: {}
    },
    loading: false,
    error: null
  },
  reducers: {
    clearComments: (state) => {
      state.comments = { project: {}, task: {} };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getComments
      .addCase(getComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.loading = false;
        const { resourceType, resourceId, comments } = action.payload;
        if (!state.comments[resourceType]) state.comments[resourceType] = {};
        // Normalize all IDs to strings
        state.comments[resourceType][resourceId] = normalizeCommentIds(comments);
      })
      .addCase(getComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // createComment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        let newComment = action.payload;
        const { resourceType, resourceId } = action.meta.arg;
        if (!state.comments[resourceType]) state.comments[resourceType] = {};
        if (!state.comments[resourceType][resourceId]) state.comments[resourceType][resourceId] = [];

        // Normalize new comment IDs to strings
        newComment = normalizeCommentIds([newComment])[0];

        if (newComment.replyTo) {
          // Find the parent comment and add this as a reply (robust string comparison)
          const addReplyToComment = (comments) => {
            for (let comment of comments) {
              if (String(comment._id) === String(newComment.replyTo)) {
                if (!comment.replies) comment.replies = [];
                comment.replies = [...comment.replies, newComment];
                return true;
              }
              if (comment.replies && addReplyToComment(comment.replies)) {
                return true;
              }
            }
            return false;
          };
          addReplyToComment(state.comments[resourceType][resourceId]);
        } else {
          state.comments[resourceType][resourceId] = [
            ...state.comments[resourceType][resourceId],
            newComment
          ];
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // updateComment
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const updateCommentInTree = (comments) => {
          for (let comment of comments) {
            if (comment._id === action.payload._id) {
              Object.assign(comment, action.payload);
              return true;
            }
            if (comment.replies && updateCommentInTree(comment.replies)) {
              return true;
            }
          }
          return false;
        };
        updateCommentInTree(state.comments[action.payload.resourceType][action.payload.resourceId]);
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        // Defensive: If 404, remove the comment from state
        if (action.error && action.error.message && action.error.message.includes('404')) {
          const { arg, dispatch } = action.meta;
          const { resourceType, resourceId, commentId } = arg;
          const removeCommentFromTree = (comments) => {
            const index = comments.findIndex(comment => comment._id === commentId);
            if (index !== -1) {
              comments.splice(index, 1);
              return true;
            }
            for (let comment of comments) {
              if (comment.replies && removeCommentFromTree(comment.replies)) {
                return true;
              }
            }
            return false;
          };
          if (state.comments[resourceType] && state.comments[resourceType][resourceId]) {
            removeCommentFromTree(state.comments[resourceType][resourceId]);
          }
          state.error = 'This comment no longer exists.';
          // Auto-refresh comments
          if (dispatch) {
            dispatch(getComments({ resourceType, resourceId }));
          }
        } else {
          state.error = action.error.message;
        }
      })
      // deleteComment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const removeCommentFromTree = (comments) => {
          const index = comments.findIndex(comment => comment._id === action.payload.commentId);
          if (index !== -1) {
            comments.splice(index, 1);
            return true;
          }
          for (let comment of comments) {
            if (comment.replies && removeCommentFromTree(comment.replies)) {
              return true;
            }
          }
          return false;
        };
        removeCommentFromTree(state.comments[action.payload.resourceType][action.payload.resourceId]);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        // Defensive: If 404, remove the comment from state
        if (action.error && action.error.message && action.error.message.includes('404')) {
          const { arg, dispatch } = action.meta;
          const { resourceType, resourceId, commentId } = arg;
          const removeCommentFromTree = (comments) => {
            const index = comments.findIndex(comment => comment._id === commentId);
            if (index !== -1) {
              comments.splice(index, 1);
              return true;
            }
            for (let comment of comments) {
              if (comment.replies && removeCommentFromTree(comment.replies)) {
                return true;
              }
            }
            return false;
          };
          if (state.comments[resourceType] && state.comments[resourceType][resourceId]) {
            removeCommentFromTree(state.comments[resourceType][resourceId]);
          }
          state.error = 'This comment no longer exists.';
          // Auto-refresh comments
          if (dispatch) {
            dispatch(getComments({ resourceType, resourceId }));
          }
        } else {
          state.error = action.error.message;
        }
      })
      // likeComment
      .addCase(likeComment.fulfilled, (state, action) => {
        const updateLikeInTree = (comments) => {
          for (let comment of comments) {
            if (comment._id === action.payload.commentId) {
              comment.isLiked = true;
              comment.likes = (comment.likes || 0) + 1;
              return true;
            }
            if (comment.replies && updateLikeInTree(comment.replies)) {
              return true;
            }
          }
          return false;
        };
        updateLikeInTree(state.comments[action.payload.resourceType][action.payload.resourceId]);
      })
      // unlikeComment
      .addCase(unlikeComment.fulfilled, (state, action) => {
        const updateLikeInTree = (comments) => {
          for (let comment of comments) {
            if (comment._id === action.payload.commentId) {
              comment.isLiked = false;
              comment.likes = Math.max(0, (comment.likes || 1) - 1);
              return true;
            }
            if (comment.replies && updateLikeInTree(comment.replies)) {
              return true;
            }
          }
          return false;
        };
        updateLikeInTree(state.comments[action.payload.resourceType][action.payload.resourceId]);
      });
  }
});

export const { clearComments, clearError } = commentSlice.actions;
export default commentSlice.reducer; 