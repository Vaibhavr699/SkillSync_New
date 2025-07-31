import api from './api';

export const getUsers = (params) => api.get('/admin/users', { params });
export const banUser = (id) => api.patch(`/admin/users/${id}/ban`);
export const unbanUser = (id) => api.patch(`/admin/users/${id}/unban`);
export const softDeleteUser = (id) => api.delete(`/admin/users/${id}`);
export const updateUserStatus = (userId, isActive) => api.put(`/admin/users/${userId}/status`, { isActive });

export const getProjects = (params) => api.get('/admin/projects', { params });
export const banProject = (id) => api.patch(`/admin/projects/${id}/ban`);
export const unbanProject = (id) => api.patch(`/admin/projects/${id}/unban`);
export const softDeleteProject = (id) => api.delete(`/admin/projects/${id}`);

export const getAdminStats = () => api.get('/admin/stats'); 