import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent,
  Checkbox,
  FormControlLabel,
  Stack,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Search,
  FilterList,
  Sort,
  Refresh,
  People,
  AttachMoney,
  Schedule,
  CheckCircle,
  Cancel,
  PlayArrow,
  Pause,
  Assignment
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  fetchProjects,
  removeProject,
  editProject,
  createProject
} from '../../store/slices/projectSlice';
import ProjectForm from '../../components/projects/ProjectForm';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { toast } from 'react-hot-toast';
import ApplicationsList from '../../components/projects/ApplicationsList';

const ProjectManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { projects, loading } = useSelector(state => state.projects);

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, project: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, projectId: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [projectMenuAnchor, setProjectMenuAnchor] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [applicationsDialog, setApplicationsDialog] = useState({ open: false, project: null });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalBudget: 0
  });

  // New filters
  const [companyFilter, setCompanyFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (user?.role === 'company') {
      dispatch(fetchProjects({ createdBy: user.id, search: searchTerm }));
    } else if (user?.role === 'admin') {
      dispatch(fetchProjects({ search: searchTerm }));
    }
  }, [dispatch, user, searchTerm]);

  useEffect(() => {
    if (projects) {
      const total = projects.length;
      const open = projects.filter(p => p.status === 'open').length;
      const inProgress = projects.filter(p => p.status === 'in-progress').length;
      const completed = projects.filter(p => p.status === 'completed').length;
      const cancelled = projects.filter(p => p.status === 'cancelled').length;
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

      setStats({
        total,
        open,
        inProgress,
        completed,
        cancelled,
        totalBudget
      });
    }
  }, [projects]);

  // If admin, force table view and hide grid/table toggle
  useEffect(() => {
    if (user?.role === 'admin') {
      setViewMode('table');
    }
  }, [user]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch =
        (project.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (Array.isArray(project.tags) && project.tags.some(tag => (tag?.toLowerCase() || '').includes(searchTerm.toLowerCase())));
      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesCompany = !companyFilter || (project.company?.name || '').toLowerCase().includes(companyFilter.toLowerCase());
      const matchesFromDate = !fromDate || new Date(project.createdAt || project.created_at) >= new Date(fromDate);
      const matchesToDate = !toDate || new Date(project.createdAt || project.created_at) <= new Date(toDate);
      return matchesSearch && matchesStatus && matchesCompany && matchesFromDate && matchesToDate;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        case 'deadline':
          aValue = new Date(a.deadline);
          bValue = new Date(b.deadline);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || a.created_at);
          bValue = new Date(b.createdAt || b.created_at);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers
  const handleCreateProject = async (projectData) => {
    try {
      await dispatch(createProject(projectData));
      setCreateDialog(false);
      toast.success('Project created successfully!');
      dispatch(fetchProjects({ createdBy: user.id }));
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      await dispatch(editProject({ projectId: editDialog.project.id, projectData }));
      setEditDialog({ open: false, project: null });
      toast.success('Project updated successfully!');
      dispatch(fetchProjects({ createdBy: user.id }));
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteDialog.projectId) return;
    
    try {
      await dispatch(removeProject(deleteDialog.projectId));
      setDeleteDialog({ open: false, projectId: null });
      toast.success('Project deleted successfully!');
      dispatch(fetchProjects({ createdBy: user.id }));
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const projectId of selectedProjects) {
        await dispatch(removeProject(projectId));
      }
      setBulkDeleteDialog(false);
      setSelectedProjects([]);
      toast.success(`${selectedProjects.length} projects deleted successfully!`);
      dispatch(fetchProjects({ createdBy: user.id }));
    } catch (error) {
      toast.error('Failed to delete some projects');
    }
  };

  const handleProjectMenuOpen = (event, project) => {
    setProjectMenuAnchor(event.currentTarget);
    setSelectedProject(project);
  };

  const handleProjectMenuClose = () => {
    setProjectMenuAnchor(null);
    setSelectedProject(null);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProjects(paginatedProjects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'in-progress': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <CheckCircle />;
      case 'in-progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'Title', 'Company', 'Status', 'Budget', 'Deadline', 'Created At'],
      ...filteredProjects.map(p => [
        p.id,
        p.title,
        p.company?.name || '',
        p.status,
        p.budget,
        p.deadline,
        p.createdAt || p.created_at
      ])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user?.role !== 'company' && user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to view this page. Only companies and admins can access project management.
        </Alert>
      </Box>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-indigo-950 px-2 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 pt-14 sm:pt-16 md:pt-17 mt-12 sm:mt-14 md:mt-16 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Assignment className="text-white text-xl sm:text-2xl" />
            </div>
    <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Project Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">
                Manage and organize your projects efficiently
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="w-full bg-white dark:bg-indigo-900 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-indigo-800">
            <div className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-300 mb-1">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-indigo-200 font-medium">Total Projects</div>
            </div>
          </div>
          <div className="w-full bg-white dark:bg-indigo-900 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-indigo-800">
            <div className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-300 mb-1">{stats.open}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-indigo-200 font-medium">Open</div>
            </div>
          </div>
          <div className="w-full bg-white dark:bg-indigo-900 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-indigo-800">
            <div className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-200 mb-1">{stats.inProgress}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-indigo-200 font-medium">In Progress</div>
            </div>
          </div>
          <div className="w-full bg-white dark:bg-indigo-900 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-indigo-800 col-span-2 sm:col-span-1">
            <div className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-300 mb-1">{stats.completed}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-indigo-200 font-medium">Completed</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-[#23234f] rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-indigo-800 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            {/* Mobile-First Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <TextField
                label="Search projects"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-white text-gray-900 dark:bg-[#23234f] dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-200 dark:border-indigo-700"
                InputProps={{
                  className: 'bg-white text-gray-900 dark:bg-[#23234f] dark:text-white text-sm sm:text-base',
                }}
                InputLabelProps={{
                  className: 'bg-white text-gray-900 dark:bg-[#23234f] dark:text-white text-sm sm:text-base',
                }}
              />
              <div className="flex gap-2 sm:gap-3">
                <FormControl size="small" className="flex-1 sm:w-32 md:w-48 bg-white text-gray-900 dark:bg-[#23234f] dark:text-white rounded-lg border border-gray-200 dark:border-indigo-700">
                  <InputLabel className="bg-white text-gray-900 dark:bg-[#23234f] dark:text-white text-sm sm:text-base">Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={e => setStatusFilter(e.target.value)}
                    className="bg-white text-gray-900 dark:bg-[#23234f] dark:text-white text-sm sm:text-base"
                  MenuProps={{
                    PaperProps: {
                      className: 'bg-white text-gray-900 dark:bg-[#23234f] dark:text-white',
                    },
                  }}
                >
                    <MenuItem value="" className="text-sm sm:text-base">All Status</MenuItem>
                    <MenuItem value="open" className="text-sm sm:text-base">Open</MenuItem>
                    <MenuItem value="in-progress" className="text-sm sm:text-base">In Progress</MenuItem>
                    <MenuItem value="completed" className="text-sm sm:text-base">Completed</MenuItem>
                    <MenuItem value="cancelled" className="text-sm sm:text-base">Cancelled</MenuItem>
                </Select>
              </FormControl>
                <FormControl size="small" className="flex-1 sm:w-32 md:w-48 bg-white text-gray-900 dark:bg-[#23234f] dark:text-white rounded-lg border border-gray-200 dark:border-indigo-700">
                  <InputLabel className="bg-white text-gray-900 dark:bg-[#23234f] dark:text-white text-sm sm:text-base">Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                    className="bg-white text-gray-900 dark:bg-[#23234f] dark:text-white text-sm sm:text-base"
                  MenuProps={{
                    PaperProps: {
                      className: 'bg-white text-gray-900 dark:bg-[#23234f] dark:text-white',
                    },
                  }}
                >
                    <MenuItem value="createdAt" className="text-sm sm:text-base">Created Date</MenuItem>
                    <MenuItem value="title" className="text-sm sm:text-base">Title</MenuItem>
                    <MenuItem value="budget" className="text-sm sm:text-base">Budget</MenuItem>
                    <MenuItem value="deadline" className="text-sm sm:text-base">Deadline</MenuItem>
                    <MenuItem value="status" className="text-sm sm:text-base">Status</MenuItem>
                </Select>
              </FormControl>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<Sort className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="rounded-xl text-xs sm:text-sm"
                sx={{
                  bgcolor: { xs: '#fff', dark: '#23234f' },
                  color: { xs: '#6366f1', dark: '#a5b4fc' },
                  borderColor: { xs: '#6366f1', dark: '#6366f1' },
                  '&:hover': { bgcolor: { xs: '#eef2ff', dark: '#3730a3' } },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 1 }
                }}
              >
                <span className="hidden sm:inline">{sortOrder === 'asc' ? 'ASC' : 'DESC'}</span>
                <span className="sm:hidden">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (user?.role === 'company') {
                    dispatch(fetchProjects({ createdBy: user.id }));
                  } else if (user?.role === 'admin') {
                    dispatch(fetchProjects());
                  }
                }}
                startIcon={<Refresh className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="rounded-xl text-xs sm:text-sm"
                sx={{
                  bgcolor: { xs: '#fff', dark: '#23234f' },
                  color: { xs: '#22c55e', dark: '#6ee7b7' },
                  borderColor: { xs: '#22c55e', dark: '#22c55e' },
                  '&:hover': { bgcolor: { xs: '#f0fdf4', dark: '#064e3b' } },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 1 }
                }}
              >
                <span className="hidden sm:inline">REFRESH</span>
                <span className="sm:hidden">SYNC</span>
              </Button>
              {/* Hide grid/table toggle for admin */}
              {user?.role !== 'admin' && (
                <Button
                  variant="outlined"
                  onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                  className="rounded-xl text-xs sm:text-sm"
                  sx={{
                    bgcolor: { xs: '#fff', dark: '#23234f' },
                    color: { xs: '#a21caf', dark: '#f0abfc' },
                    borderColor: { xs: '#a21caf', dark: '#a21caf' },
                    '&:hover': { bgcolor: { xs: '#fdf4ff', dark: '#581c87' } },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.5, sm: 1 }
                  }}
                >
                  <span className="hidden md:inline">{viewMode === 'table' ? 'GRID VIEW' : 'TABLE VIEW'}</span>
                  <span className="md:hidden">{viewMode === 'table' ? 'GRID' : 'TABLE'}</span>
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add className="w-4 h-4 sm:w-5 sm:h-5" />}
                onClick={() => setCreateDialog(true)}
                className="rounded-xl font-semibold shadow-md transition-colors duration-200 flex-1 sm:flex-initial"
                sx={{
                  bgcolor: { xs: '#6366f1', dark: '#6366f1' },
                  color: '#fff',
                  boxShadow: 3,
                  '&:hover': { bgcolor: { xs: '#4f46e5', dark: '#3730a3' } },
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.05rem' },
                  px: { xs: 2, sm: 2.5, md: 3 },
                  py: { xs: 1, sm: 1.25, md: 1.5 },
                  textTransform: 'none',
                }}
              >
                <span className="hidden sm:inline">CREATE PROJECT</span>
                <span className="sm:hidden">CREATE</span>
              </Button>
            </div>
          </div>

          {selectedProjects.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-sm font-medium text-blue-800">
                {selectedProjects.length} project(s) selected
              </span>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setBulkDeleteDialog(true)}
                startIcon={<Delete className="w-4 h-4" />}
                className="border-red-500 text-red-600 hover:bg-red-50 rounded-xl text-sm"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 1 }
                }}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Projects Table/Grid */}
        {loading ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 sm:h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[50vh] sm:h-[60vh] overflow-y-auto">
            {viewMode === 'table' ? (
              <div className="bg-white dark:bg-[#23234f] rounded-xl sm:rounded-2xl shadow-lg border border-indigo-100 dark:bg-[#23234f] dark:border-indigo-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <TableContainer component={Paper} className="rounded-xl sm:rounded-2xl shadow border border-indigo-100 dark:bg-[#23234f] dark:border-indigo-800 dark:text-white" sx={{ bgcolor: { xs: '#fff', dark: '#23234f' }, color: { xs: 'inherit', dark: '#fff' } }}>
                    <Table className="min-w-full divide-y divide-gray-200 dark:divide-indigo-800" sx={{ bgcolor: { xs: '#fff', dark: '#23234f' }, color: { xs: 'inherit', dark: '#fff' } }}>
                      <TableHead className="bg-gray-50 dark:bg-indigo-950">
                        <tr>
                          <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-left">
                            <Checkbox
                              indeterminate={selectedProjects.length > 0 && selectedProjects.length < paginatedProjects.length}
                              checked={selectedProjects.length === paginatedProjects.length && paginatedProjects.length > 0}
                              onChange={handleSelectAll}
                              className="text-blue-600"
                              size="small"
                            />
                          </th>
                          <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">Title</th>
                          <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Status</th>
                          <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white hidden md:table-cell">Budget</th>
                          <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white hidden lg:table-cell">Deadline</th>
                          <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white hidden lg:table-cell">Applications</th>
                          <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white hidden xl:table-cell">Created</th>
                          <th className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">Actions</th>
                        </tr>
                      </TableHead>
                      <TableBody className="divide-y divide-gray-200 dark:divide-indigo-800">
                        {paginatedProjects.map((project) => (
                          <TableRow className="bg-white even:bg-gray-50 dark:bg-indigo-900 dark:even:bg-indigo-950 hover:bg-gray-50 transition-colors duration-200">
                            <TableCell className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                              <Checkbox
                                checked={selectedProjects.includes(project.id)}
                                onChange={() => handleSelectProject(project.id)}
                                className="text-blue-600"
                                size="small"
                              />
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate max-w-32 sm:max-w-48">{project.title}</div>
                                <div className="text-xs sm:text-sm text-gray-500 dark:text-indigo-200 line-clamp-1 sm:hidden">
                                  {project.description?.substring(0, 30)}...
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 dark:text-indigo-200 line-clamp-1 hidden sm:block">
                                  {project.description?.substring(0, 50)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden sm:table-cell">
                              <Chip
                                icon={getStatusIcon(project.status)}
                                label={project.status}
                                color={getStatusColor(project.status)}
                                size="small"
                                className="text-xs"
                              />
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell">
                              <span className="font-semibold text-blue-600 dark:text-blue-300 text-sm sm:text-base">
                                ₹{project.budget?.toLocaleString('en-IN')}
                              </span>
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden lg:table-cell">
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-indigo-200">
                                {format(new Date(project.deadline), 'MMM dd, yyyy')}
                              </span>
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden lg:table-cell">
                              <Chip
                                icon={<People />}
                                label={project.applications?.length || 0}
                                size="small"
                                variant="outlined"
                                className="text-xs"
                              />
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden xl:table-cell">
                              <span className="text-xs sm:text-sm text-gray-700 dark:text-indigo-200">
                                {format(new Date(project.createdAt || project.created_at), 'MMM dd, yyyy')}
                              </span>
                            </TableCell>
                            <TableCell className="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleProjectMenuOpen(e, project)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <MoreVert className="w-4 h-4 sm:w-5 sm:h-5" />
                                </IconButton>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
                <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredProjects.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    sx={{
                      '& .MuiTablePagination-toolbar': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minHeight: { xs: '40px', sm: '52px' }
                      },
                      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {paginatedProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-5 md:p-6">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2 sm:mr-3">
                          {project.title}
                        </h3>
                        <IconButton
                          size="small"
                          onClick={(e) => handleProjectMenuOpen(e, project)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVert className="w-4 h-4 sm:w-5 sm:h-5" />
                        </IconButton>
                      </div>
                      
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                        {project.description?.substring(0, 100)}...
                      </p>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
                        <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-300">
                          ₹{project.budget?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-indigo-200">
                          Due: {format(new Date(project.deadline), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                        <Chip
                          icon={getStatusIcon(project.status)}
                          label={project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                          className="text-xs dark:bg-indigo-800 dark:text-indigo-100"
                          sx={{ 
                            bgcolor: { xs: undefined, dark: '#23234f' }, 
                            color: { xs: undefined, dark: '#fff' },
                            fontSize: { xs: '0.625rem', sm: '0.75rem' }
                          }}
                        />
                        <Chip
                          icon={<People className="w-3 h-3 sm:w-4 sm:h-4" />}
                          label={project.applications?.length || 0}
                          size="small"
                          variant="outlined"
                          className="text-xs dark:bg-indigo-800 dark:text-indigo-100"
                          sx={{ 
                            bgcolor: { xs: undefined, dark: '#23234f' }, 
                            color: { xs: undefined, dark: '#fff' }, 
                            borderColor: { xs: undefined, dark: '#3f3f7f' },
                            fontSize: { xs: '0.625rem', sm: '0.75rem' }
                          }}
                        />
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          component={Link}
                          to={`/dashboard/projects/${project.id}`}
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility className="w-3 h-3 sm:w-4 sm:h-4" />}
                          className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-200 dark:hover:bg-indigo-800 rounded-xl"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.5, sm: 1 }
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<People className="w-3 h-3 sm:w-4 sm:h-4" />}
                          className="flex-1 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-200 dark:hover:bg-indigo-800 rounded-xl"
                          onClick={() => setApplicationsDialog({ open: true, project })}
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.5, sm: 1 }
                          }}
                        >
                          <span className="hidden sm:inline">Applications</span>
                          <span className="sm:hidden">Apps</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Project Menu */}
        <Menu
          anchorEl={projectMenuAnchor}
          open={Boolean(projectMenuAnchor)}
          onClose={handleProjectMenuClose}
        >
          <MenuItem onClick={() => {
            setEditDialog({ open: true, project: selectedProject });
            handleProjectMenuClose();
          }}>Edit</MenuItem>
          <MenuItem onClick={() => {
            setDeleteDialog({ open: true, projectId: selectedProject.id });
            handleProjectMenuClose();
          }}>Delete</MenuItem>
        </Menu>

        {/* Confirmation Dialogs */}
        <ConfirmationDialog
          open={createDialog}
          onClose={() => setCreateDialog(false)}
          onConfirm={handleCreateProject}
          title="Create Project"
          content={<ProjectForm onSubmit={handleCreateProject} />}
        />
        <ConfirmationDialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, project: null })}
          onConfirm={handleEditProject}
          title="Edit Project"
          content={<ProjectForm onSubmit={handleEditProject} initialValues={editDialog.project} submitText="Update Project" />}
        />
        <ConfirmationDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, projectId: null })}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          content={`Are you sure you want to delete this project? This action cannot be undone.`}
        />
        <ConfirmationDialog
          open={bulkDeleteDialog}
          onClose={() => setBulkDeleteDialog(false)}
          onConfirm={handleBulkDelete}
          title="Delete Projects"
          content={`Are you sure you want to delete the selected projects? This action cannot be undone.`}
        />
        <ConfirmationDialog
          open={applicationsDialog.open}
          onClose={() => setApplicationsDialog({ open: false, project: null })}
          onConfirm={() => {
            // Handle application confirmation
          }}
          title="Applications"
          content={<ApplicationsList project={applicationsDialog.project} />}
        />
      </div>
    </div>
  );
};

export default ProjectManagement;