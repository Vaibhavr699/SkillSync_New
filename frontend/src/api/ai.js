import api from './api';

export const askAI = async (projectId, question) => {
  const response = await api.post('/ai/ask', { projectId, question });
  return response.data;
};

export const getAISuggestions = async (projectId) => {
  const response = await api.get(`/ai/suggestions/${projectId}`);
  return response.data;
};