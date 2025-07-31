import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createProject as createProjectAPI, 
  getProjects, 
  getProjectById, 
  updateProject as updateProjectAPI, 
  deleteProject,
  applyToProject,
  getProjectApplications,
  updateApplicationStatus,
  getMyApplications,
  getCompanyApplications
} from '../../api/projects';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getProjects(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getProjectById(projectId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addProject = createAsyncThunk(
  'projects/addProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await createProjectAPI(projectData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const editProject = createAsyncThunk(
  'projects/editProject',
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const response = await updateProjectAPI({ projectId, projectData });
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProjectPartial',
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const response = await updateProjectAPI({ projectId, projectData });
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeProject = createAsyncThunk(
  'projects/removeProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const applyForProject = createAsyncThunk(
  'projects/applyForProject',
  async ({ projectId, coverLetter, proposedBudget, estimatedDuration, relevantExperience }, { rejectWithValue }) => {
    try {
      const response = await applyToProject({ 
        projectId, 
        coverLetter, 
        proposedBudget, 
        estimatedDuration, 
        relevantExperience 
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchApplications = createAsyncThunk(
  'projects/fetchApplications',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getProjectApplications(projectId);
      return { projectId, applications: response };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateApplication = createAsyncThunk(
  'projects/updateApplication',
  async ({ projectId, applicationId, status, feedback }, { rejectWithValue }) => {
    try {
      const response = await updateApplicationStatus({ projectId, applicationId, status, feedback });
      return { projectId, applicationId, application: response };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMyApplications = createAsyncThunk(
  'projects/fetchMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyApplications();
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCompanyApplications = createAsyncThunk(
  'projects/fetchCompanyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCompanyApplications();
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await createProjectAPI(projectData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    applications: {},
    myApplications: [],
    companyApplications: [],
    loading: false,
    error: null,
    totalPages: 1,
  },
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.projects = action.payload.map(p => ({ ...p, id: p.id || p._id }));
          state.totalPages = 1;
        } else {
          state.projects = action.payload.projects.map(p => ({ ...p, id: p.id || p._id }));
          state.totalPages = action.payload.totalPages || 1;
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch projects';
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = { ...action.payload, id: action.payload.id || action.payload._id };
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch project';
      })
      .addCase(addProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(addProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create project';
      })
      .addCase(editProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        );
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(editProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update project';
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        );
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update project';
      })
      .addCase(removeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project._id !== action.payload);
      })
      .addCase(removeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete project';
      })
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications[action.payload.projectId] = action.payload.applications;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch applications';
      })
      .addCase(updateApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, applicationId, application } = action.payload;
        if (state.applications[projectId]) {
          state.applications[projectId] = state.applications[projectId].map(app =>
            app._id === applicationId ? application : app
          );
        }
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update application';
      })
      .addCase(fetchCompanyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.companyApplications = action.payload;
      })
      .addCase(fetchCompanyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch company applications';
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create project';
      });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;