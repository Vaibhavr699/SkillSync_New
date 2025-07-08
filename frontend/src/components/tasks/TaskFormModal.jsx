import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Chip,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  MenuItem,
  LinearProgress,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  AvatarGroup,
  Divider,
  Alert,
  Tooltip,
  Fab
} from '@mui/material';
import { 
  Add, 
  Delete, 
  AttachFile, 
  CloudUpload,
  PersonAdd,
  Schedule,
  CheckCircle,
  Close
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { addTask, editTask, fetchProjectTeam } from '../../store/slices/taskSlice';
import { format } from 'date-fns';

const initialTaskState = {
  title: '',
  description: '',
  due_date: '',
  assigned_to: '',
  checklist: [],
  files: []
};

const TaskFormModal = ({ open, onClose, task, projectId }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.tasks);
  const { team } = useSelector(state => state.tasks);
  const [form, setForm] = useState(initialTaskState);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  console.log('TaskFormModal - received projectId:', projectId);

  useEffect(() => {
    console.log('TaskFormModal useEffect - projectId:', projectId, 'task:', task);
    if (task) {
      // Parse checklist safely
      let checklist = [];
      if (typeof task.checklist === 'string') {
        try {
          checklist = JSON.parse(task.checklist);
        } catch {
          checklist = [];
        }
      } else if (Array.isArray(task.checklist)) {
        checklist = task.checklist;
      }

      setForm({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        assigned_to: task.assigned_to || '',
        checklist: checklist,
        files: []
      });
    } else {
      setForm(initialTaskState);
    }
    setLocalError('');
    setUploading(false);
  }, [task, open]);

  useEffect(() => {
    if (open && projectId) {
      dispatch(fetchProjectTeam(projectId));
    }
  }, [open, projectId, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddChecklist = () => {
    if (newChecklistItem.trim()) {
      const currentChecklist = form.checklist || [];
      setForm({
        ...form,
        checklist: [
          ...currentChecklist,
          { id: Date.now().toString(), text: newChecklistItem, completed: false }
        ]
      });
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklist = (id) => {
    const currentChecklist = form.checklist || [];
    setForm({
      ...form,
      checklist: currentChecklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    });
  };

  const handleRemoveChecklist = (id) => {
    const currentChecklist = form.checklist || [];
    setForm({
      ...form,
      checklist: currentChecklist.filter(item => item.id !== id)
    });
  };

  const validateFields = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Task title is required.';
    if (!form.description.trim()) errors.description = 'Description is required.';
    if (!form.due_date) errors.due_date = 'Due date is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setLocalError('');
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setUploading(false);
      return;
    }
    try {
      console.log('Creating task for project:', projectId);
      
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('due_date', form.due_date);
      // formData.append('assigned_to', form.assigned_to || ''); // Temporarily disabled for testing
      formData.append('checklist', JSON.stringify(form.checklist || []));
      formData.append('status', 'todo'); // Default status for new tasks
      
      if (task) {
        // Edit existing task
        const result = await dispatch(editTask({ 
          projectId, 
          taskId: task.id, 
          taskData: formData 
        })).unwrap();
      } else {
        // Create new task
        const result = await dispatch(addTask({ 
          projectId, 
          taskData: formData 
        })).unwrap();
      }
      
      setUploading(false);
      onClose();
    } catch (err) {
      console.error('Task creation error:', err);
      setLocalError(err.message || 'Failed to save task');
      setUploading(false);
    }
  };

  // Calculate checklist progress
  const checklistCompleted = (form.checklist || []).filter(item => item.completed).length;
  const checklistTotal = (form.checklist || []).length;
  const checklistProgress = checklistTotal > 0 ? (checklistCompleted / checklistTotal) * 100 : 0;

  const displayError = localError || error;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">
          {task ? 'Edit Task' : 'Create New Task'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit} id="task-form-modal-form">
          {displayError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {displayError}
            </Alert>
          )}

          {/* Basic Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Basic Information
            </Typography>
            
            <TextField
              label="Task Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              placeholder="Enter task title..."
              error={!!fieldErrors.title}
              helperText={fieldErrors.title && <span style={{fontSize:12,color:'#d32f2f',marginTop:2,marginBottom:4,display:'block'}}>{fieldErrors.title}</span>}
            />
            
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              placeholder="Describe the task..."
              error={!!fieldErrors.description}
              helperText={fieldErrors.description && <span style={{fontSize:12,color:'#d32f2f',marginTop:2,marginBottom:4,display:'block'}}>{fieldErrors.description}</span>}
            />
          </Box>

          {/* Assignment */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Assignment
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign to</InputLabel>
              <Select
                name="assigned_to"
                value={form.assigned_to}
                onChange={handleChange}
                label="Assign to"
                startAdornment={
                  <InputAdornment position="start">
                    <PersonAdd color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {team[projectId]?.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        src={member.photo} 
                        sx={{ width: 24, height: 24 }}
                      >
                        {member.name?.charAt(0)}
                      </Avatar>
                      <Typography>{member.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Due Date */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Due Date
            </Typography>
            
            <TextField
              label="Due Date"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Schedule color="action" />
                  </InputAdornment>
                ),
              }}
              error={!!fieldErrors.due_date}
              helperText={fieldErrors.due_date && <span style={{fontSize:12,color:'#d32f2f',marginTop:2,marginBottom:4,display:'block'}}>{fieldErrors.due_date}</span>}
            />
          </Box>

          {/* Checklist */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Checklist
            </Typography>
            
            {checklistTotal > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress: {checklistCompleted}/{checklistTotal}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(checklistProgress)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={checklistProgress} 
                  sx={{ height: 6, borderRadius: 3 }} 
                />
              </Box>
            )}
            
            <List dense>
              {(form.checklist || []).map((item) => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <Checkbox
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(item.id)}
                    color="primary"
                  />
                  <ListItemText
                    primary={item.text}
                    sx={{
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'text.secondary' : 'text.primary'
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleRemoveChecklist(item.id)}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                placeholder="Add checklist item..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddChecklist()}
                size="small"
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAddChecklist}
                disabled={!newChecklistItem.trim()}
                startIcon={<Add />}
              >
                Add
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="task-form-modal-form"
          variant="contained"
          disabled={uploading || !form.title.trim()}
          startIcon={uploading ? <LinearProgress size={16} /> : <CheckCircle />}
        >
          {uploading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormModal; 