import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Autocomplete,
  Divider,
  Tooltip,
  Fab,
  Menu,
  MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Add,
  Business,
  Assignment,
  People,
  AttachMoney,
  Schedule,
  TrendingUp,
  CheckCircle,
  Close,
  Edit,
  Delete,
  Visibility,
  FileUpload,
  Dashboard,
  ViewList,
  Description,
  Assessment,
  Settings,
  MoreVert
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchProjects, 
  fetchCompanyApplications,
  createProject,
  removeProject,
  editProject
} from '../../store/slices/projectSlice';
import { format } from 'date-fns';
import ProjectForm from '../../components/projects/ProjectForm';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { toast } from 'react-hot-toast';

const CompanyDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { projects, companyApplications, loading } = useSelector(state => state.projects);
  
  const [activeTab, setActiveTab] = useState(0);
  const [createProjectDialog, setCreateProjectDialog] = useState(false);
  const [editProjectDialog, setEditProjectDialog] = useState({ open: false, project: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, projectId: null });
  const [projectMenuAnchor, setProjectMenuAnchor] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalBudget: 0
  });

  // Debug logging
  console.log('CompanyDashboard render:', { user, loading, projects, companyApplications });

  // Simple test render to see if component loads
  console.log('CompanyDashboard component is rendering');

  useEffect(() => {
    console.log('CompanyDashboard useEffect - user:', user);
    if (user?.role === 'company') {
      console.log('Fetching data for company user');
      dispatch(fetchProjects({ company_id: user.company_id }));
      dispatch(fetchCompanyApplications());
    } else {
      console.log('User is not a company or not authenticated:', user);
    }
  }, [dispatch, user]);

  // Filter projects to only those belonging to the current company
  const filteredProjects = Array.isArray(projects)
    ? projects.filter(p => p.company_id && p.company_id === user.company_id && p.created_by !== null && p.created_by !== undefined && p.created_by !== 1) // Exclude admin-created (assuming admin id is 1)
    : [];

  // Update stats calculation to use filteredProjects
  useEffect(() => {
    if (filteredProjects && companyApplications) {
      const totalProjects = filteredProjects.length;
      const activeProjects = filteredProjects.filter(p => p.status === 'open' || p.status === 'in-progress').length;
      const totalApplications = companyApplications.length;
      const pendingApplications = companyApplications.filter(app => app.status === 'pending').length;
      const totalBudget = filteredProjects.reduce((sum, project) => sum + (project.budget || 0), 0);

      setStats({
        totalProjects,
        activeProjects,
        totalApplications,
        pendingApplications,
        totalBudget
      });
    }
  }, [filteredProjects, companyApplications]);

  const handleCreateProject = async (projectData) => {
    try {
      await dispatch(createProject(projectData));
      setCreateProjectDialog(false);
      toast.success('Project created successfully!');
      // Refresh data
      dispatch(fetchProjects({ company_id: user.company_id }));
      dispatch(fetchCompanyApplications());
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      await dispatch(editProject({ projectId: editProjectDialog.project.id, projectData }));
      setEditProjectDialog({ open: false, project: null });
      toast.success('Project updated successfully!');
      // Refresh data
      dispatch(fetchProjects({ company_id: user.company_id }));
      dispatch(fetchCompanyApplications());
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
      // Refresh data
      dispatch(fetchProjects({ company_id: user.company_id }));
      dispatch(fetchCompanyApplications());
    } catch (error) {
      toast.error('Failed to delete project');
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

  const handleEditClick = () => {
    if (selectedProject) {
      setEditProjectDialog({ open: true, project: selectedProject });
    }
    handleProjectMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedProject) {
      setDeleteDialog({ open: true, projectId: selectedProject.id });
    }
    handleProjectMenuClose();
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

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Show loading state if user is not loaded yet
  if (!user) {
    console.log('No user found, showing loading state');
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is a company
  if (user.role !== 'company') {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Access Denied
            </div>
            <div className="text-red-500">
              You don't have permission to view this page. Only companies can access the company dashboard.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Business className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Company Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your projects, applications, and business overview
                </p>
              </div>
            </div>
            <Button
              variant="contained"
              component={Link}
              to="/dashboard/project-management"
              startIcon={<Assignment />}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Project Management
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            Debug Info: User Role: {user?.role || 'None'}, Loading: {loading ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-2">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Assignment className="text-blue-600 text-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-2">Active Projects</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeProjects}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="text-green-600 text-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-2">Total Applications</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalApplications}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <People className="text-indigo-600 text-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-2">Total Budget</p>
                  <p className="text-3xl font-bold text-amber-600">₹{stats.totalBudget.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AttachMoney className="text-amber-600 text-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab(0)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 0
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Description className="text-lg" />
                  <span>Applications</span>
                  {stats.pendingApplications > 0 && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                      {stats.pendingApplications}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 1
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ViewList className="text-lg" />
                  <span>Projects</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 2
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Assessment className="text-lg" />
                  <span>Analytics</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Applications Tab */}
            {activeTab === 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Applications</h3>
                  <Button 
                    component={Link} 
                    to="/dashboard/company-applications"
                    variant="outlined"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    View All Applications
                  </Button>
                </div>

                {/* Recent Applications grouped by project */}
                {companyApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Description className="text-gray-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-500 mb-6">
                        When freelancers apply to your projects, you'll see their applications here.
                      </p>
                      <Button 
                        variant="contained" 
                        startIcon={<Add />}
                        onClick={() => setCreateProjectDialog(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      >
                        Create Your First Project
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredProjects.map(project => {
                      // Get the most recent application for this project
                      const projectApps = companyApplications
                        .filter(app => app.project_id === project.id)
                        .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
                      if (projectApps.length === 0) return null;
                      const recentApp = projectApps[0];
                      return (
                        <div key={project.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center space-x-4">
                            <Avatar 
                              src={recentApp.freelancer_photo}
                              className="w-12 h-12 border-2 border-white shadow-md"
                            >
                              {recentApp.freelancer_name?.charAt(0)}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  {recentApp.freelancer_name}
                                </h4>
                                <Chip 
                                  label={recentApp.status} 
                                  size="small"
                                  color={getApplicationStatusColor(recentApp.status)}
                                  className="text-xs"
                                />
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                Applied to: <span className="font-semibold text-blue-700">{project.title}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(recentApp.applied_at), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-xs text-gray-700 mt-1">
                                {recentApp.proposal?.slice(0, 100)}...
                              </p>
                            </div>
                            <Button
                              component={Link}
                              to={`/dashboard/projects/${project.id}?tab=applications`}
                              size="small"
                              variant="outlined"
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      );
                    }).filter(Boolean).slice(0, 5)}
                  </div>
                )}

                {/* Applications grouped by project */}
                <div className="mt-10">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Applications by Project</h4>
                  {filteredProjects.map(project => {
                    const projectApps = companyApplications.filter(app => app.project_id === project.id);
                    if (projectApps.length === 0) return null;
                    return (
                      <div key={project.id} className="mb-8">
                        <div className="font-semibold text-blue-700 mb-2 text-base">{project.title}</div>
                        <div className="space-y-2">
                          {projectApps.map(app => (
                            <div key={app.id} className="bg-white rounded-lg shadow p-3 flex items-center gap-4">
                              <Avatar src={app.freelancer_photo} className="w-8 h-8" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{app.freelancer_name}</div>
                                <div className="text-xs text-gray-500">{app.proposal?.slice(0, 80)}...</div>
                              </div>
                              <Chip label={app.status} size="small" color={getApplicationStatusColor(app.status)} />
                              <Button
                                component={Link}
                                to={`/dashboard/projects/${project.id}?tab=applications`}
                                size="small"
                                variant="outlined"
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                Review
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 1 && (
              <div className="flex-1 min-h-0">
                <div className="overflow-y-auto max-h-[70vh]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Your Projects</h3>
                    <Button 
                      variant="contained" 
                      startIcon={<Add />}
                      onClick={() => setCreateProjectDialog(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Create New Project
                    </Button>
                  </div>

                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Assignment className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-500 mb-6">
                          Create your first project to start attracting freelancers.
                        </p>
                        <Button 
                          variant="contained" 
                          startIcon={<Add />}
                          onClick={() => setCreateProjectDialog(true)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                          Create Your First Project
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
                                {project.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Chip 
                                  label={project.status} 
                                  size="small"
                                  color={getStatusColor(project.status)}
                                  className="text-xs"
                                />
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleProjectMenuOpen(e, project)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <MoreVert />
                                </IconButton>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {project.description?.substring(0, 120)}...
                            </p>

                            <div className="flex justify-between items-center mb-4">
                              <span className="text-lg font-bold text-blue-600">
                                ₹{project.budget?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-sm text-gray-500">
                                Due: {format(new Date(project.deadline), 'MMM dd, yyyy')}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.tags?.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                              {project.tags?.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{project.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="px-6 pb-6">
                            <div className="flex space-x-2">
                              <Button
                                component={Link}
                                to={`/dashboard/projects/${project.id}`}
                                size="small"
                                variant="outlined"
                                startIcon={<Visibility />}
                                className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                View
                              </Button>
                              <Button
                                component={Link}
                                to={`/dashboard/projects/${project.id}?tab=applications`}
                                size="small"
                                variant="outlined"
                                startIcon={<People />}
                                className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                              >
                                Applications
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Project Analytics</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h4>
                    <div className="space-y-4">
                      {['open', 'in-progress', 'completed', 'cancelled'].map((status) => {
                        const statusCount = filteredProjects.filter(p => p.status === status).length;
                        const percentage = filteredProjects.length > 0 ? (statusCount / filteredProjects.length) * 100 : 0;
                        return (
                          <div key={status} className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="capitalize">{status.replace('-', ' ')}</span>
                              <span>{statusCount}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div
                                className={`h-2.5 rounded-full ${status === 'open' ? 'bg-blue-500' : status === 'in-progress' ? 'bg-yellow-500' : status === 'completed' ? 'bg-green-500' : 'bg-gray-400'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h4>
                    <div className="space-y-4">
                      {['pending', 'accepted', 'rejected'].map((status) => {
                        const count = companyApplications.filter(app => app.status === status).length;
                        const percentage = companyApplications.length > 0 ? (count / companyApplications.length) * 100 : 0;
                        return (
                          <div key={status} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  status === 'pending' ? 'bg-yellow-500' :
                                  status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Project Dialog */}
        <Dialog 
          open={createProjectDialog} 
          onClose={() => setCreateProjectDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              maxHeight: '90vh',
              borderRadius: '16px'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            Create New Project
          </DialogTitle>
          <DialogContent sx={{ 
            overflow: 'auto',
            p: 0
          }}>
            <ProjectForm 
              onSubmit={handleCreateProject}
              onCancel={() => setCreateProjectDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog 
          open={editProjectDialog.open} 
          onClose={() => setEditProjectDialog({ open: false, project: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              maxHeight: '90vh',
              borderRadius: '16px'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            Edit Project
          </DialogTitle>
          <DialogContent sx={{ 
            overflow: 'auto',
            p: 0
          }}>
            <ProjectForm 
              initialValues={editProjectDialog.project}
              onSubmit={handleEditProject}
              onCancel={() => setEditProjectDialog({ open: false, project: null })}
              submitText="Update Project"
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialog.open}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          onConfirm={handleDeleteProject}
          onCancel={() => setDeleteDialog({ open: false, projectId: null })}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
        />

        {/* Project Menu */}
        <Menu
          anchorEl={projectMenuAnchor}
          open={Boolean(projectMenuAnchor)}
          onClose={handleProjectMenuClose}
        >
          <MenuItemComponent onClick={handleEditClick}>
            <Edit sx={{ mr: 1 }} />
            Edit Project
          </MenuItemComponent>
          <MenuItemComponent onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete Project
          </MenuItemComponent>
        </Menu>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
          onClick={() => setCreateProjectDialog(true)}
        >
          <Add />
        </Fab>
      </div>
    </div>
  );
};

export default CompanyDashboard; 