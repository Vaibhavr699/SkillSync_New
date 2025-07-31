import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';
import { register as registerAPI, login as loginAPI } from '../../api/auth';

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // If we can't decode the token, consider it expired
  }
};

const persistedAuth = localStorage.getItem('auth')
  ? JSON.parse(localStorage.getItem('auth'))
  : { user: null, token: null };

// Check if persisted token is expired
if (persistedAuth.token && isTokenExpired(persistedAuth.token)) {
  localStorage.removeItem('auth');
  persistedAuth.user = null;
  persistedAuth.token = null;
}

const initialState = {
  user: persistedAuth.user,
  token: persistedAuth.token,
  isAuthenticated: !!persistedAuth.token && !isTokenExpired(persistedAuth.token),
  loading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerAPI(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginAPI(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      if (!action.payload || !action.payload.token) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth');
        return;
      }
      const { token, user } = action.payload;
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth');
        return;
      }
      
      state.user = user || jwtDecode(token);
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('auth', JSON.stringify({ token, user: state.user }));
    },
    checkCredentials: (state) => {
      // Check if current token is still valid
      if (state.token && isTokenExpired(state.token)) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { accessToken, user } = action.payload;
        state.token = accessToken;
        state.user = user;
        state.isAuthenticated = true;
        localStorage.setItem('auth', JSON.stringify({ token: accessToken, user }));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      });
  },
});

export const { setCredentials, checkCredentials, logout, setLoading, setError, clearError } = authSlice.actions;

export default authSlice.reducer;