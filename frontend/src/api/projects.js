import api from './api';
import qs from 'qs';

export const createProject = async (projectData) => {
  // Check if we have files to upload
  if (projectData.files && projectData.files.length > 0) {
    const formData = new FormData();
    
    // Add basic project data
    formData.append('title', projectData.title);
    formData.append('description', projectData.description);
    formData.append('budget', projectData.budget);
    formData.append('deadline', projectData.deadline);
    formData.append('status', projectData.status);
    
    // Add tags as JSON string
    if (projectData.tags && projectData.tags.length > 0) {
      formData.append('tags', JSON.stringify(projectData.tags));
    }
    
    // Add files
    projectData.files.forEach((file, index) => {
      if (file instanceof File) {
        formData.append('files', file);
      } else if (file.id || file._id) {
        // If it's already uploaded, just pass the ID
        formData.append('fileIds', file.id || file._id);
      }
    });
    
    const response = await api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // No files, send as JSON
    const response = await api.post('/projects', projectData);
    return response.data;
  }
};

export const getProjects = async (params = {}) => {
  const response = await api.get('/projects', {
    params,
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
  });
  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async ({ projectId, projectData }) => {
  const response = await api.put(`/projects/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

export const applyToProject = async ({ projectId, coverLetter, proposedBudget, estimatedDuration, relevantExperience }) => {
  const response = await api.post(`/projects/${projectId}/apply`, { 
    coverLetter, 
    proposedBudget, 
    estimatedDuration, 
    relevantExperience 
  });
  return response.data;
};

export const getProjectApplications = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/applications`);
  return response.data;
};

export const updateApplicationStatus = async ({ projectId, applicationId, status, feedback }) => {
  const response = await api.put(`/projects/${projectId}/applications/${applicationId}`, { 
    status,
    feedback: feedback || undefined
  });
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/projects/my-applications');
  return response.data;
};

export const getCompanyApplications = async () => {
  const response = await api.get('/projects/company-applications');
  return response.data;
};

export const getProjectTeam = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/team`);
  return response.data;
};