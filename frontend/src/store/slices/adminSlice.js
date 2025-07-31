import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../api/admin';

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (params = {}) => {
  const response = await adminApi.getUsers(params);
  return response.data;
});

export const banUser = createAsyncThunk('admin/banUser', async (userId) => {
  await adminApi.banUser(userId);
  return userId;
});

export const unbanUser = createAsyncThunk('admin/unbanUser', async (userId) => {
  await adminApi.unbanUser(userId);
  return userId;
});

export const softDeleteUser = createAsyncThunk('admin/softDeleteUser', async (userId) => {
  await adminApi.softDeleteUser(userId);
  return userId;
});

export const fetchProjects = createAsyncThunk('admin/fetchProjects', async (params = {}) => {
  const response = await adminApi.getProjects(params);
  return response.data;
});

export const banProject = createAsyncThunk('admin/banProject', async (projectId) => {
  await adminApi.banProject(projectId);
  return projectId;
});

export const unbanProject = createAsyncThunk('admin/unbanProject', async (projectId) => {
  await adminApi.unbanProject(projectId);
  return projectId;
});

export const softDeleteProject = createAsyncThunk('admin/softDeleteProject', async (projectId) => {
  await adminApi.softDeleteProject(projectId);
  return projectId;
});

export const fetchAdminStats = createAsyncThunk('admin/fetchAdminStats', async () => {
  const response = await adminApi.getAdminStats();
  return response.data;
});

export const updateUserStatus = createAsyncThunk('admin/updateUserStatus', async ({ userId, isActive }) => {
  const response = await adminApi.updateUserStatus(userId, isActive);
  return response.data;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    projects: [],
    stats: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(banUser.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload);
        if (user) user.is_banned = true;
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload);
        if (user) user.is_banned = false;
      })
      .addCase(softDeleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(fetchProjects.pending, (state) => { state.loading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(banProject.fulfilled, (state, action) => {
        const project = state.projects.find(p => p.id === action.payload);
        if (project) project.status = 'banned';
      })
      .addCase(unbanProject.fulfilled, (state, action) => {
        const project = state.projects.find(p => p.id === action.payload);
        if (project) project.status = 'open';
      })
      .addCase(softDeleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
      });
  },
});

export default adminSlice.reducer; 