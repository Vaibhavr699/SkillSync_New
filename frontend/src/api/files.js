import axios from 'axios';
import store from '../store/store';

const API_URL = import.meta.env.VITE_API_URL;

const fileApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add request interceptor to include token
fileApi.interceptors.request.use(
  (config) => {
    const { token } = store.getState().auth;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const uploadFile = async (formData, onUploadProgress) => {
  const response = await fileApi.post('/files/upload', formData, {
    onUploadProgress,
  });
  return response.data;
};

export const getFile = async (fileId) => {
  const response = await fileApi.get(`/files/${fileId}`);
  return response.data;
};

export const getFileVersions = async (fileId) => {
  const response = await fileApi.get(`/files/${fileId}/versions`);
  return response.data;
};

export const downloadFile = async (fileId) => {
  const response = await fileApi.get(`/files/${fileId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await fileApi.delete(`/files/${fileId}`);
  return response.data;
};