import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Alert,
  Skeleton,
  Badge,
  Switch,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import { 
  Add, 
  MoreVert, 
  FilterList,
  ViewColumn,
  Refresh,
  Assignment,
  Schedule,
  CheckCircle,
  Warning,
  Sync,
  AutoMode
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchTasks, 
  changeTaskStatus, 
  removeTask,
  fetchProjectTeam,
  reorderProjectTasks,
  fetchTaskAttachments
} from '../../store/slices/taskSlice';
import TaskCard from '../../components/tasks/TaskCard';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import { format } from 'date-fns';
import { useThemeContext } from '../../context/ThemeContext';

const statusColumns = [
  { 
    id: 'todo', 
    title: 'To Do', 
    color: '#e3f2fd',
    icon: <Schedule color="action" />,
    limit: 10
  },
  { 
    id: 'in-progress', 
    title: 'In Progress', 
    color: '#fff3e0',
    icon: <Assignment color="warning" />,
    limit: 5
  },
  { 
    id: 'review', 
    title: 'Review', 
    color: '#f3e5f5',
    icon: <CheckCircle color="info" />,
    limit: 8
  },
  { 
    id: 'done', 
    title: 'Done', 
    color: '#e8f5e8',
    icon: <CheckCircle color="success" />,
    limit: 15
  },
];

const statusOptions = [
  { id: '', title: 'All Statuses' },
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

// Droppable column wrapper
const DroppableColumn = ({ id, activeId, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: '400px',
        bgcolor: isOver ? 'action.hover' : 'transparent',
        transition: 'background-color 0.2s ease',
        borderRadius: 1,
        p: 1,
        border: isOver ? '2px dashed #1976d2' : 'none',
      }}
    >
      {children}
    </Box>
  );
};

// Draggable task card wrapper
const DraggableTaskCard = ({ task, onEdit, onDelete, userRole }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });
  
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
    >
      <TaskCard 
        task={task} 
        onEdit={onEdit} 
        onDelete={onDelete}
        isDragging={isDragging}
        userRole={userRole}
      />
    </div>
  );
};

const TaskBoard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { tasks, loading, error, team } = useSelector(state => state.tasks);
  const { user } = useSelector(state => state.auth);
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    assignee: '',
    dueDate: '',
    search: '',
  });
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';

  console.log('TaskBoard - projectId from useParams:', projectId);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tasks function
  const fetchTasksData = useCallback(async () => {
    if (projectId) {
      try {
        const result = await dispatch(fetchTasks({ projectId, filters }));
        setLastSync(new Date());
        setSyncMessage('Tasks updated successfully');
        // Fetch attachments for all tasks after tasks are loaded
        const loadedTasks = result.payload?.tasks || [];
        loadedTasks.forEach(task => {
          dispatch(fetchTaskAttachments({ projectId, taskId: task.id }));
        });
      } catch (error) {
        setSyncMessage('Failed to update tasks');
      }
    }
  }, [dispatch, projectId, filters]);

  // Initial data fetch
  useEffect(() => {
    console.log('TaskBoard useEffect - projectId:', projectId);
    if (projectId) {
      fetchTasksData();
      dispatch(fetchProjectTeam(projectId));
    }
  }, [projectId, fetchTasksData, dispatch]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await dispatch(changeTaskStatus({ projectId, taskId, status: newStatus }));
      setSyncMessage('Task status updated');
    } catch (error) {
      console.error('Failed to update task status:', error);
      setSyncMessage('Failed to update task status');
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      await dispatch(removeTask({ projectId, taskId: task.id }));
      setSyncMessage('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      setSyncMessage('Failed to delete task');
    }
  };

  const handleManualSync = async () => {
    setSyncMessage('Syncing...');
    await fetchTasksData();
  };

  const filteredTasks = (status) => {
    const projectTasks = tasks[projectId] || [];
    return projectTasks.filter(task => {
      // Status filter
      if (task.status !== status) return false;
      
      // Search filter
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !task.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Assignee filter
      if (filters.assignee && task.assigned_to !== filters.assignee) {
        return false;
      }
      
      // Due date filter
      if (filters.dueDate && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const filterDate = new Date(filters.dueDate);
        if (taskDate > filterDate) return false;
      }
      
      return true;
    });
  };

  // DnD Kit handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.data.current?.status !== over.id) {
      handleStatusChange(active.id, over.id);
    }
  };

  const handleDragOver = (event) => {
    // Optional: Add visual feedback during drag
  };

  // Get task statistics
  const getTaskStats = () => {
    const projectTasks = tasks[projectId] || [];
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const overdue = projectTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    
    return { 
      total, 
      completed, 
      overdue,
      progress: total > 0 ? (completed / total) * 100 : 0 
    };
  };

  const stats = getTaskStats();

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with Stats - dark theme support */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
        background: isDark ? 'linear-gradient(90deg, #181840 60%, #23234f 100%)' : '#fff',
        color: isDark ? '#fff' : 'inherit',
        border: isDark ? '1px solid #23234f' : '1px solid #e0e0e0',
      }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ color: isDark ? '#fff' : 'inherit' }}>Project Tasks</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={`${stats.total} Total`} size="small" sx={{ bgcolor: isDark ? '#23234f' : undefined, color: isDark ? '#fff' : undefined, borderColor: isDark ? '#3f3f7f' : undefined }} />
            <Chip label={`${stats.completed} Completed`} size="small" color="success" sx={{ bgcolor: isDark ? '#1e5631' : undefined, color: isDark ? '#fff' : undefined, borderColor: isDark ? '#3f3f7f' : undefined }} />
            {stats.overdue > 0 && (
              <Chip 
                icon={<Warning sx={{ color: isDark ? '#ffb300' : undefined }} />} 
                label={`${stats.overdue} Overdue`} 
                size="small" 
                color="error" 
                sx={{ bgcolor: isDark ? '#7c1c1c' : undefined, color: isDark ? '#fff' : undefined, borderColor: isDark ? '#3f3f7f' : undefined }}
              />
            )}
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={stats.progress} 
            sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: isDark ? '#23234f' : undefined, '& .MuiLinearProgress-bar': { backgroundColor: isDark ? '#6c63ff' : undefined } }}
          />
          {lastSync && (
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: isDark ? '#bdbdbd' : 'text.secondary' }}>
              Last updated: {format(lastSync, 'HH:mm:ss')}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Manual Sync">
            <span>
              <IconButton onClick={handleManualSync} disabled={loading}>
                <Sync />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Toggle Filters">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterList color={showFilters ? 'primary' : 'action'} />
            </IconButton>
          </Tooltip>
          {user?.role === 'company' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedTask(null);
                setOpenTaskForm(true);
              }}
            >
              New Task
            </Button>
          )}
        </Box>
      </Box>

      {/* Filter Bar */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Filters</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search tasks"
              size="small"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              sx={{ minWidth: 200 }}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              sx={{ minWidth: 150 }}
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.id} value={opt.id}>{opt.title}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Assignee"
              size="small"
              value={filters.assignee}
              onChange={e => setFilters(f => ({ ...f, assignee: e.target.value }))}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Users</MenuItem>
              {(team[projectId] || []).map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      src={member.photo} 
                      sx={{ width: 20, height: 20 }}
                    >
                      {member.name?.charAt(0)}
                    </Avatar>
                    <Typography>{member.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Due Before"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.dueDate}
              onChange={e => setFilters(f => ({ ...f, dueDate: e.target.value }))}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilters({ status: '', assignee: '', dueDate: '', search: '' })}
            >
              Clear
            </Button>
          </Box>
        </Paper>
      )}

      {/* Kanban Board */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {/* Responsive Kanban Board: grid that wraps columns to new rows based on screen size */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '100vw',
            pb: 4,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              minHeight: '600px',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
            }}
          >
            {statusColumns.map((column) => {
              const columnTasks = filteredTasks(column.id);
              const isOverLimit = columnTasks.length > column.limit;
              return (
                <Paper
                  key={column.id}
                  sx={{
                    p: 1.2,
                    bgcolor: { xs: column.color, dark: '#23234f' },
                    border: isOverLimit ? '2px solid #f44336' : { xs: '1px solid #e0e0e0', dark: '1px solid #3f3f7f' },
                    color: { xs: 'inherit', dark: '#fff' },
                    position: 'relative',
                    boxShadow: 3,
                    minWidth: 0,
                    maxWidth: 500,
                    width: '100%',
                    borderRadius: 3,
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {column.icon}
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: { xs: 'inherit', dark: '#fff' } }}>
                        {column.title}
                      </Typography>
                    </Box>
                    <Badge
                      badgeContent={columnTasks.length}
                      color={isOverLimit ? 'error' : 'primary'}
                      max={999}
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: { xs: undefined, dark: '#3949ab' },
                          color: { xs: undefined, dark: '#fff' },
                          fontWeight: 700,
                        },
                      }}
                    >
                      <Chip
                        label={`${columnTasks.length}/${column.limit}`}
                        size="small"
                        variant="outlined"
                        color={isOverLimit ? 'error' : 'default'}
                        sx={{
                          backgroundColor: { xs: undefined, dark: '#23234f' },
                          color: { xs: undefined, dark: '#fff' },
                          borderColor: { xs: undefined, dark: '#3f3f7f' },
                          fontWeight: 700,
                        }}
                      />
                    </Badge>
                  </Box>
                  {isOverLimit && (
                    <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
                      Column limit exceeded! Consider moving tasks.
                    </Alert>
                  )}
                  {/* Droppable area */}
                  <DroppableColumn id={column.id} activeId={activeId}>
                    {loading ? (
                      <Box sx={{ space: 1 }}>
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 1, borderRadius: 1 }} />
                        ))}
                      </Box>
                    ) : columnTasks.length === 0 ? (
                      <Box
                        sx={{
                          textAlign: 'center',
                          color: 'text.disabled',
                          py: 4,
                          border: '2px dashed #e0e0e0',
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Typography variant="body2">No tasks in this column</Typography>
                        <Typography variant="caption">Drop tasks here</Typography>
                      </Box>
                    ) : (
                      columnTasks.map((task) => (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          onEdit={user?.role === 'company' ? () => {
                            setSelectedTask(task);
                            setOpenTaskForm(true);
                          } : undefined}
                          onDelete={user?.role === 'company' ? () => handleDeleteTask(task) : undefined}
                          userRole={user?.role}
                        />
                      ))
                    )}
                  </DroppableColumn>
                </Paper>
              );
            })}
          </Box>
        </Box>
        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <TaskCard
              task={tasks[projectId]?.find((t) => t.id === activeId)}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskFormModal
        open={openTaskForm}
        onClose={() => {
          setOpenTaskForm(false);
          // Refresh tasks after modal closes to show new/updated tasks
          fetchTasksData();
        }}
        task={selectedTask}
        projectId={projectId}
        userRole={user?.role}
      />

      {/* Sync Status Snackbar */}
      <Snackbar
        open={!!syncMessage}
        autoHideDuration={3000}
        onClose={() => setSyncMessage('')}
        message={syncMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default TaskBoard;