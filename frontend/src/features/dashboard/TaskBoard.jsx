import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  IconButton,
  LinearProgress,
  Alert
} from '@mui/material';
import { Add, MoreVert } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks, addTask } from '../../store/slices/taskSlice';
import TaskColumn from '../tasks/TaskColumn';
import TaskFormModal from '../../components/tasks/TaskFormModal';

const statusColumns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

const TaskBoard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { tasks: tasksByProject, loading, error } = useSelector(state => state.tasks);
  const tasks = projectId
    ? Array.isArray(tasksByProject?.[projectId]) ? tasksByProject[projectId] : []
    : Object.values(tasksByProject).flat();
  const [openTaskForm, setOpenTaskForm] = useState(false);

  useEffect(() => {
    if (projectId && projectId !== 'undefined') {
      dispatch(fetchTasks(projectId));
    } else {
      dispatch(fetchTasks());
    }
  }, [dispatch, projectId]);

  const handleCreateTask = async (taskData) => {
    await dispatch(addTask({ projectId, taskData }));
    setOpenTaskForm(false);
  };

  const filteredTasks = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Project Tasks</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenTaskForm(true)}
          >
            New Task
          </Button>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2
        }}>
          {statusColumns.map((column) => (
            <TaskColumn
              key={column.id}
              title={column.title}
              tasks={filteredTasks(column.id)}
              status={column.id}
              projectId={projectId}
            />
          ))}
        </Box>

        <TaskFormModal
          open={openTaskForm}
          onClose={() => setOpenTaskForm(false)}
          onSubmit={handleCreateTask}
          projectId={projectId}
        />
      </Box>
    </div>
  );
};

export default TaskBoard;