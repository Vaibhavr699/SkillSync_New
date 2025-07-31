import api from './api';

export const createTask = async ({ projectId, taskData }) => {
  console.log('API createTask called with:', { projectId, taskData });
  const url = `/projects/${projectId}/tasks`;
  console.log('Making POST request to:', url);
  console.log('Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3456/api');
  console.log('Full URL will be:', (import.meta.env.VITE_API_URL || 'http://localhost:3456/api') + url);
  const response = await api.post(url, taskData);
  console.log('API createTask response:', response.data);
  return response.data;
};

export const getTasks = async (projectId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/projects/${projectId}/tasks${params ? `?${params}` : ''}`);
  return response.data;
};

export const getTaskById = async ({ projectId, taskId }) => {
  const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
  return response.data;
};

export const updateTask = async ({ projectId, taskId, taskData }) => {
  const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async ({ projectId, taskId }) => {
  const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  return response.data;
};

export const updateTaskStatus = async ({ projectId, taskId, status }) => {
  const response = await api.put(`/projects/${projectId}/tasks/${taskId}/status`, { status });
  return response.data;
};

export const assignTask = async ({ projectId, taskId, userId }) => {
  const response = await api.put(`/projects/${projectId}/tasks/${taskId}/assign`, { assigned_to: userId || '' });
  return response.data;
};

export const updateChecklistItem = async ({ projectId, taskId, itemId, completed, text }) => {
  const response = await api.put(
    `/projects/${projectId}/tasks/${taskId}/checklist/${itemId}`,
    { completed, text }
  );
  return response.data;
};

// New API functions for enhanced task management

export const getProjectTeam = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/team`);
  return response.data;
};

export const addChecklistItem = async ({ projectId, taskId, text }) => {
  const response = await api.post(`/projects/${projectId}/tasks/${taskId}/checklist`, { text });
  return response.data;
};

export const deleteChecklistItem = async ({ projectId, taskId, itemId }) => {
  const response = await api.delete(`/projects/${projectId}/tasks/${taskId}/checklist/${itemId}`);
  return response.data;
};

export const uploadTaskFiles = async ({ projectId, taskId, files }) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await api.post(`/projects/${projectId}/tasks/${taskId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getTaskAttachments = async ({ projectId, taskId }) => {
  const response = await api.get(`/projects/${projectId}/tasks/${taskId}/files`);
  return response.data;
};

export const deleteTaskAttachment = async ({ projectId, taskId, attachmentId }) => {
  const response = await api.delete(`/projects/${projectId}/tasks/${taskId}/files/${attachmentId}`);
  return response.data;
};

export const getTaskComments = async ({ projectId, taskId }) => {
  const response = await api.get(`/projects/${projectId}/tasks/${taskId}/comments`);
  return response.data;
};

export const addTaskComment = async ({ projectId, taskId, content }) => {
  const response = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content });
  return response.data;
};

export const reorderTasks = async ({ projectId, taskIds }) => {
  const response = await api.put(`/projects/${projectId}/tasks/reorder`, { taskIds });
  return response.data;
};