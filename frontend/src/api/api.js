import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3456/api',
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    let token = state?.auth?.token;
    if (!token) {
      // Try to get from localStorage 'auth' object
      const persisted = localStorage.getItem('auth');
      if (persisted) {
        try {
          token = JSON.parse(persisted).token;
        } catch {}
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, logout user
      store.dispatch(logout());
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 