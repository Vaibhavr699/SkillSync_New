import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Avatar, 
  AvatarGroup,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  LinearProgress,
  Badge,
  Collapse,
  Button,
  TextField,
  Alert,
  Skeleton,
  Tabs,
  Tab
} from '@mui/material';
import { 
  MoreVert, 
  PersonAdd, 
  AttachFile, 
  Comment,
  CheckCircleOutline,
  RadioButtonUnchecked,
  Edit,
  Delete,
  Schedule,
  Flag,
  ExpandMore,
  ExpandLess,
  Send,
  CloudDownload,
  Visibility
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateTaskChecklist, 
  addChecklistItemToTask,
  removeChecklistItem,
  uploadFilesToTask,
  fetchTaskAttachments,
  removeTaskAttachment,
  fetchTaskComments,
  addCommentToTask,
  assignTaskToUser
} from '../../store/slices/taskSlice';
import FileViewer from '../files/FileViewer';
import CommentSection from '../comments/CommentSection';
import FileUpload from '../files/FileUpload';
import { useThemeContext } from '../../context/ThemeContext';
import { getComments, createComment, updateComment, deleteComment as deleteCommentApi } from '../../api/comments';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete,
  onDragStart,
  onAssign,
  isDragging = false,
  userRole,
  projectId
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showFiles, setShowFiles] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState(0);
  
  const dispatch = useDispatch();
  const { attachments, comments, team } = useSelector(state => state.tasks);
  const { user } = useSelector(state => state.auth);
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';

  const taskAttachments = attachments[task.project]?.[task.id] || [];
  const taskComments = comments[task.project]?.[task.id] || [];

  useEffect(() => {
    if (showFiles && taskAttachments.length === 0) {
      dispatch(fetchTaskAttachments({ projectId: task.project, taskId: task.id }));
    }
    if (showComments && taskComments.length === 0) {
      dispatch(fetchTaskComments({ projectId: task.project, taskId: task.id }));
    }
  }, [showFiles, showComments, task.project, task.id, dispatch]);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChecklistToggle = async (itemId, completed) => {
    if (!task.project || !task.id) {
      console.error('Checklist update aborted: missing projectId or taskId');
      return;
    }
    try {
      await dispatch(updateTaskChecklist({
        projectId: task.project,
        taskId: task.id,
        itemId,
        completed: !completed
      }));
    } catch (error) {
      console.error('Failed to update checklist:', error);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;
    
    try {
      await dispatch(addChecklistItemToTask({
        projectId: task.project,
        taskId: task.id,
        text: newChecklistItem
      }));
      setNewChecklistItem('');
    } catch (error) {
      console.error('Failed to add checklist item:', error);
    }
  };

  const handleRemoveChecklistItem = async (itemId) => {
    try {
      await dispatch(removeChecklistItem({
        projectId: task.project,
        taskId: task.id,
        itemId
      }));
    } catch (error) {
      console.error('Failed to remove checklist item:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      await dispatch(uploadFilesToTask({
        projectId: task.project,
        taskId: task.id,
        files
      }));
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await dispatch(addCommentToTask({
        projectId: task.project,
        taskId: task.id,
        content: newComment
      }));
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAssignTask = async (userId) => {
    try {
      await dispatch(assignTaskToUser({
        projectId: task.project,
        taskId: task.id,
        userId: userId || ''
      }));
      handleMenuClose();
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  // Parse checklist safely
  let checklistArr = [];
  if (typeof task.checklist === 'string') {
    try {
      checklistArr = JSON.parse(task.checklist);
    } catch {
      checklistArr = [];
    }
  } else if (Array.isArray(task.checklist)) {
    checklistArr = task.checklist;
  } else {
    checklistArr = [];
  }

  // Calculate checklist progress
  const checklistCompleted = checklistArr.filter(item => item.completed || false).length;
  const checklistTotal = checklistArr.length;
  const checklistProgress = checklistTotal > 0 ? (checklistCompleted / checklistTotal) * 100 : 0;

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Card
      sx={{ 
        mb: 2, 
        cursor: 'grab', 
        boxShadow: isDragging ? 8 : 1, 
        transition: 'all 0.2s ease',
        transform: isDragging ? 'rotate(5deg) scale(1.02)' : 'none',
        opacity: isDragging ? 0.8 : 1,
        border: isOverdue ? '2px solid #f44336' : isDark ? '1px solid #23234f' : '1px solid #e0e0e0',
        background: isDark ? '#23234f' : '#fff',
        color: isDark ? '#fff' : 'inherit',
        '&:hover': {
          boxShadow: isDragging ? 8 : 4,
        },
        width: '100%'
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        if (onDragStart) onDragStart(task.id);
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2, background: isDark ? '#181840' : undefined, borderRadius: 2 }}
          TabIndicatorProps={isDark ? { style: { background: '#6c63ff' } } : {}}>
          <Tab label="Details" sx={{ color: isDark ? '#fff' : undefined }} />
          <Tab label="Files" sx={{ color: isDark ? '#fff' : undefined }} />
          {/* <Tab label="Comments" sx={{ color: isDark ? '#fff' : undefined }} /> */}
        </Tabs>
        {tab === 0 && (
          <>
            {/* Header with title and menu */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1rem', 
                  fontWeight: 600,
                  lineHeight: 1.2,
                  flex: 1,
                  mr: 1
                }}
              >
                {task.title}
              </Typography>
              {userRole === 'company' && (
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert fontSize="small" />
              </IconButton>
              )}
            </Box>

            {/* Description */}
            {task.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4
                }}
              >
                {task.description}
              </Typography>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Schedule fontSize="small" color={isOverdue ? 'error' : 'action'} />
                <Typography 
                  variant="caption" 
                  color={isOverdue ? 'error' : 'text.secondary'}
                  sx={{ fontWeight: isOverdue ? 600 : 400 }}
                >
                  Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  {isOverdue && ' (Overdue)'}
                </Typography>
              </Box>
            )}

            {/* Status */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Chip
                label={task.status?.replace('_', ' ')}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ bgcolor: isDark ? '#23234f' : undefined, color: isDark ? '#fff' : undefined, borderColor: isDark ? '#3f3f7f' : undefined }}
              />
            </Box>

            {/* Checklist Summary */}
            {checklistTotal > 0 && (
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Checklist ({checklistCompleted}/{checklistTotal})
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowChecklist(!showChecklist)}
                  >
                    {showChecklist ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={checklistProgress} 
                  sx={{ height: 4, borderRadius: 1, mb: 0.5, bgcolor: isDark ? '#181840' : undefined, '& .MuiLinearProgress-bar': { backgroundColor: isDark ? '#6c63ff' : undefined } }} 
                />
              </Box>
            )}

            {/* Expanded Checklist */}
            <Collapse in={showChecklist}>
              <Box sx={{ mb: 1 }}>
                <List dense sx={{ py: 0 }}>
                  {checklistArr.map((item) => (
                    <ListItem key={item.id} sx={{ px: 0, py: 0.5 }}>
                      <Checkbox
                        checked={item.completed || false}
                        onChange={() => handleChecklistToggle(item.id, item.completed || false)}
                        size="small"
                        color="primary"
                      />
                      <ListItemText
                        primary={item.text || ''}
                        sx={{
                          textDecoration: (item.completed || false) ? 'line-through' : 'none',
                          color: (item.completed || false) ? 'text.secondary' : 'text.primary',
                          fontSize: '0.875rem'
                        }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveChecklistItem(item.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    placeholder="Add item..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddChecklistItem}
                    disabled={!newChecklistItem.trim()}
                    size="small"
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </>
        )}
        {tab === 1 && (
          <div>
            {/* Only company or assigned member can upload files */}
            {((user?.role === 'company') || (user && (user.id === task.assigned_to || user._id === task.assigned_to))) && (
              <FileUpload
                multiple
                resourceType="task"
                resourceId={task.id}
                onUploadComplete={() => dispatch(fetchTaskAttachments({ projectId: task.project, taskId: task.id }))}
              />
            )}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Uploaded Files ({taskAttachments.length})
            </Typography>
            <FileViewer
              files={taskAttachments.map(f => ({
                ...f,
                filename: f.filename || f.file_name,
                url: f.url || f.file_url,
                size: f.size || f.file_size,
                mimetype: f.mimetype || f.file_type,
              }))}
              title="Task Files"
            />
          </div>
        )}
        {tab === 2 && (
          {/* Comments tab is hidden */}
        )}
      </CardContent>

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && userRole === 'company'}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { onEdit && onEdit(task); handleMenuClose(); }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Task
        </MenuItem>
        <MenuItem onClick={() => { onDelete && onDelete(task); handleMenuClose(); }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Task
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskCard;