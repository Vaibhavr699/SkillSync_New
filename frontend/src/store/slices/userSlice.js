import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfilePicture,
  getFreelancers,
  getCompanies,
  updateUserSkills
} from '../../api/users';
import { setCredentials } from './authSlice';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getUserProfile(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const response = await updateUserProfile(userData);
      // Also update auth.user
      const token = thunkAPI.getState().auth.token;
      thunkAPI.dispatch(setCredentials({ user: response, token }));
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'user/uploadProfileImage',
  async (formData, thunkAPI) => {
    try {
      const response = await uploadProfilePicture(formData);
      // Refetch the latest profile to get the new photo
      const userId = thunkAPI.getState().auth.user?._id || thunkAPI.getState().auth.user?.id;
      if (userId) {
        const updatedProfile = await getUserProfile(userId);
        const token = thunkAPI.getState().auth.token;
        thunkAPI.dispatch(setCredentials({ user: updatedProfile, token }));
      }
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const fetchFreelancers = createAsyncThunk(
  'user/fetchFreelancers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getFreelancers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCompanies = createAsyncThunk(
  'user/fetchCompanies',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getCompanies(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSkills = createAsyncThunk(
  'user/updateSkills',
  async (skills, { rejectWithValue }) => {
    try {
      const response = await updateUserSkills(skills);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    freelancers: [],
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch user profile';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.profilePicture = action.payload.photoUrl;
          state.profile.photo = action.payload.photoUrl;
        }
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to upload profile picture';
      })
      .addCase(fetchFreelancers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreelancers.fulfilled, (state, action) => {
        state.loading = false;
        state.freelancers = action.payload;
      })
      .addCase(fetchFreelancers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch freelancers';
      })
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch companies';
      })
      .addCase(updateSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update skills';
      });
  },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;