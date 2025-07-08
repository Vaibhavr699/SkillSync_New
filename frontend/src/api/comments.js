import api from './api';

export const createComment = async ({ resourceType, resourceId, content, parentId = null }) => {
  const response = await api.post(`/${resourceType}/${resourceId}/comments`, {
    content,
    parentId,
  });
  return response.data;
};

export const getComments = async ({ resourceType, resourceId }) => {
  const response = await api.get(`/${resourceType}/${resourceId}/comments`);
  return response.data;
};

export const updateComment = async ({ resourceType, resourceId, commentId, content }) => {
  const response = await api.put(`/${resourceType}/${resourceId}/comments/${commentId}`, {
    content,
  });
  return response.data;
};

export const deleteComment = async ({ resourceType, resourceId, commentId }) => {
  const response = await api.delete(`/${resourceType}/${resourceId}/comments/${commentId}`);
  return response.data;
};