import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask,
  updateTaskStatus,
  assignTask,
  updateChecklistItem,
  getProjectTeam,
  addChecklistItem,
  deleteChecklistItem,
  uploadTaskFiles,
  getTaskAttachments,
  deleteTaskAttachment,
  getTaskComments,
  addTaskComment,
  reorderTasks
} from '../../api/tasks';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ projectId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await getTasks(projectId, filters);
      return { projectId, tasks: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const response = await getTaskById({ projectId, taskId });
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      const response = await createTask({ projectId, taskData });
      return { projectId, task: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async ({ projectId, taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await updateTask({ projectId, taskId, taskData });
      return { projectId, task: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      await deleteTask({ projectId, taskId });
      return { projectId, taskId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const changeTaskStatus = createAsyncThunk(
  'tasks/changeTaskStatus',
  async ({ projectId, taskId, status }, { rejectWithValue }) => {
    try {
      const response = await updateTaskStatus({ projectId, taskId, status });
      return { projectId, task: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const assignTaskToUser = createAsyncThunk(
  'tasks/assignTaskToUser',
  async ({ projectId, taskId, userId }, { rejectWithValue }) => {
    try {
      const response = await assignTask({ projectId, taskId, userId });
      return { projectId, task: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProjectTeam = createAsyncThunk(
  'tasks/fetchProjectTeam',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getProjectTeam(projectId);
      return { projectId, team: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addChecklistItemToTask = createAsyncThunk(
  'tasks/addChecklistItem',
  async ({ projectId, taskId, text }, { rejectWithValue }) => {
    try {
      const response = await addChecklistItem({ projectId, taskId, text });
      return { projectId, task: response.task, newItem: response.newItem };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTaskChecklist = createAsyncThunk(
  'tasks/updateTaskChecklist',
  async ({ projectId, taskId, itemId, completed, text }, { rejectWithValue }) => {
    try {
      const response = await updateChecklistItem({ projectId, taskId, itemId, completed, text });
      return { projectId, task: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeChecklistItem = createAsyncThunk(
  'tasks/removeChecklistItem',
  async ({ projectId, taskId, itemId }, { rejectWithValue }) => {
    try {
      const response = await deleteChecklistItem({ projectId, taskId, itemId });
      return { projectId, task: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadFilesToTask = createAsyncThunk(
  'tasks/uploadFiles',
  async ({ projectId, taskId, files }, { rejectWithValue }) => {
    try {
      const response = await uploadTaskFiles({ projectId, taskId, files });
      return { projectId, taskId, attachments: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTaskAttachments = createAsyncThunk(
  'tasks/fetchTaskAttachments',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const response = await getTaskAttachments({ projectId, taskId });
      return { projectId, taskId, attachments: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeTaskAttachment = createAsyncThunk(
  'tasks/removeTaskAttachment',
  async ({ projectId, taskId, attachmentId }, { rejectWithValue }) => {
    try {
      await deleteTaskAttachment({ projectId, taskId, attachmentId });
      return { projectId, taskId, attachmentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTaskComments = createAsyncThunk(
  'tasks/fetchTaskComments',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const response = await getTaskComments({ projectId, taskId });
      return { projectId, taskId, comments: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addCommentToTask = createAsyncThunk(
  'tasks/addComment',
  async ({ projectId, taskId, content }, { rejectWithValue }) => {
    try {
      const response = await addTaskComment({ projectId, taskId, content });
      return { projectId, taskId, comment: response };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const reorderProjectTasks = createAsyncThunk(
  'tasks/reorderTasks',
  async ({ projectId, taskIds }, { rejectWithValue }) => {
    try {
      await reorderTasks({ projectId, taskIds });
      return { projectId, taskIds };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  tasks: {},
  team: {},
  attachments: {},
  comments: {},
  loading: false,
  error: null,
  currentTask: null
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    updateTaskInStore: (state, action) => {
      const { projectId, task } = action.payload;
      if (state.tasks[projectId]) {
        const index = state.tasks[projectId].findIndex(t => t.id === task.id);
        if (index !== -1) {
          state.tasks[projectId][index] = task;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, tasks } = action.payload;
        state.tasks[projectId] = tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add task
      .addCase(addTask.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        if (!state.tasks[projectId]) {
          state.tasks[projectId] = [];
        }
        state.tasks[projectId].push(task);
      })
      
      // Edit task
      .addCase(editTask.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        if (state.tasks[projectId]) {
          const index = state.tasks[projectId].findIndex(t => t.id === task.id);
          if (index !== -1) {
            state.tasks[projectId][index] = task;
          }
        }
      })
      
      // Remove task
      .addCase(removeTask.fulfilled, (state, action) => {
        const { projectId, taskId } = action.payload;
        if (state.tasks[projectId]) {
          state.tasks[projectId] = state.tasks[projectId].filter(t => t.id !== taskId);
        }
      })
      
      // Change task status
      .addCase(changeTaskStatus.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        if (state.tasks[projectId]) {
          const index = state.tasks[projectId].findIndex(t => t.id === task.id);
          if (index !== -1) {
            state.tasks[projectId][index] = task;
          }
        }
      })
      
      // Assign task
      .addCase(assignTaskToUser.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        if (state.tasks[projectId]) {
          const index = state.tasks[projectId].findIndex(t => t.id === task.id);
          if (index !== -1) {
            state.tasks[projectId][index] = task;
          }
        }
      })
      
      // Fetch project team
      .addCase(fetchProjectTeam.fulfilled, (state, action) => {
        const { projectId, team } = action.payload;
        state.team[projectId] = team;
      })
      
      // Add checklist item
      .addCase(addChecklistItemToTask.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        if (state.tasks[projectId]) {
          const index = state.tasks[projectId].findIndex(t => t.id === task.id);
          if (index !== -1) {
            state.tasks[projectId][index] = task;
          }
        }
      })
      
      // Update checklist item
      .addCase(updateTaskChecklist.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        if (state.tasks[projectId]) {
          const index = state.tasks[projectId].findIndex(t => t.id === task.id);
          if (index !== -1) {
            state.tasks[projectId][index] = task;
          }
        }
      })
      
      // Remove checklist item
      .addCase(removeChecklistItem.fulfilled, (state, action) => {
        const { projectId, task } = action.payload;
        if (state.tasks[projectId]) {
          const index = state.tasks[projectId].findIndex(t => t.id === task.id);
          if (index !== -1) {
            state.tasks[projectId][index] = task;
          }
        }
      })
      
      // Upload files
      .addCase(uploadFilesToTask.fulfilled, (state, action) => {
        const { projectId, taskId, attachments } = action.payload;
        if (!state.attachments[projectId]) {
          state.attachments[projectId] = {};
        }
        if (!state.attachments[projectId][taskId]) {
          state.attachments[projectId][taskId] = [];
        }
        state.attachments[projectId][taskId].push(...attachments);
      })
      
      // Fetch attachments
      .addCase(fetchTaskAttachments.fulfilled, (state, action) => {
        const { projectId, taskId, attachments } = action.payload;
        if (!state.attachments[projectId]) {
          state.attachments[projectId] = {};
        }
        state.attachments[projectId][taskId] = attachments;
      })
      
      // Remove attachment
      .addCase(removeTaskAttachment.fulfilled, (state, action) => {
        const { projectId, taskId, attachmentId } = action.payload;
        if (state.attachments[projectId]?.[taskId]) {
          state.attachments[projectId][taskId] = state.attachments[projectId][taskId].filter(
            a => a.id !== attachmentId
          );
        }
      })
      
      // Fetch comments
      .addCase(fetchTaskComments.fulfilled, (state, action) => {
        const { projectId, taskId, comments } = action.payload;
        if (!state.comments[projectId]) {
          state.comments[projectId] = {};
        }
        state.comments[projectId][taskId] = comments;
      })
      
      // Add comment
      .addCase(addCommentToTask.fulfilled, (state, action) => {
        const { projectId, taskId, comment } = action.payload;
        if (!state.comments[projectId]) {
          state.comments[projectId] = {};
        }
        if (!state.comments[projectId][taskId]) {
          state.comments[projectId][taskId] = [];
        }
        state.comments[projectId][taskId].push(comment);
      });
  }
});

export const { clearError, setCurrentTask, clearCurrentTask, updateTaskInStore } = taskSlice.actions;
export default taskSlice.reducer;