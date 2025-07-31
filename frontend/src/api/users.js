import api from './api';

export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const uploadProfilePicture = async (formData) => {
  const response = await api.post('/users/profile-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getFreelancers = async (params = {}) => {
  const response = await api.get('/users/freelancers', { params });
  return response.data;
};

export const getCompanies = async (params = {}) => {
  const response = await api.get('/users/companies', { params });
  return response.data;
};

export const updateUserSkills = async (skills) => {
  const response = await api.put('/users/skills', { skills });
  return response.data;
};

export const searchUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getPublicUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}/public`);
  return response.data;
};