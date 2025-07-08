import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectById, 
  editProject, 
  removeProject,
  fetchApplications,
  updateApplication,
  applyForProject,
  addProject,
  updateProject
} from '../../store/slices/projectSlice';
import FileViewer from '../../components/files/FileViewer';
import CommentSection from '../../components/comments/CommentSection';
import TaskBoard from '../tasks/TaskBoard';
import ApplicationForm from '../../components/projects/ApplicationForm';
import ApplicationsList from '../../components/projects/ApplicationsList';
import { format } from 'date-fns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import RichTextEditor from '../../components/common/RichTextEditor';
import LoadingButton from '../../components/common/LoadingButton';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import FileUpload from '../../components/files/FileUpload';
import { toast } from 'react-hot-toast';
import ProjectAnalytics from '../../components/projects/ProjectAnalytics';
import AIAssistant from '../ai/AIAssistant';
import ProjectForm from './ProjectForm';

// Icons
import { 
  HiOutlineChatBubbleOvalLeftEllipsis,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineArrowLeft,
  HiOutlineBriefcase,
  HiOutlineDocumentCheck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUserAdd,
  HiOutlineChatAlt2,
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineEye,
  HiOutlineFolder,
  HiOutlinePaperClip
} from 'react-icons/hi';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, loading, error, applications } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [tabValue, setTabValue] = useState(queryTab || 'overview');
  const [editMode, setEditMode] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { tasks: tasksByProject } = useSelector(state => state.tasks);
  const tasks = Array.isArray(tasksByProject?.[projectId]) ? tasksByProject[projectId] : [];
  const [taskTimes, setTaskTimes] = useState({});
  const [fileRefresh, setFileRefresh] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);

  const projectApplications = applications[projectId] || [];

  useEffect(() => {
    if (projectId && projectId !== 'new' && projectId !== 'undefined') {
      dispatch(fetchProjectById(projectId));
      if (user?.role === 'company') {
        dispatch(fetchApplications(projectId));
      }
    }
  }, [dispatch, projectId, user?.role]);

  const refreshApplications = () => {
    if (projectId && user?.role === 'company') {
      dispatch(fetchApplications(projectId));
    }
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const handleEditSubmit = async (values) => {
    await dispatch(editProject({ projectId, projectData: values }));
    setEditMode(false);
  };

  const handleDeleteProject = async () => {
    await dispatch(removeProject(projectId));
    setDeleteDialogOpen(false);
    navigate('/dashboard/projects');
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      await dispatch(updateApplication({ projectId, applicationId, status })).unwrap();
      toast.success(`Application ${status} successfully`);
      if (projectId) {
        dispatch(fetchProjectById(projectId));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update application status');
    }
  };

  const handleApplySubmit = async (applicationData) => {
    try {
      await dispatch(applyForProject({ 
        projectId, 
        ...applicationData 
      })).unwrap();
      setApplyDialogOpen(false);
      toast.success('Application submitted successfully!');
      if (projectId) {
        dispatch(fetchProjectById(projectId));
        dispatch(fetchApplications(projectId));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedApplication || !feedbackText.trim()) return;
    
    try {
      await dispatch(updateApplication({ 
        projectId,
        applicationId: selectedApplication.id || selectedApplication._id, 
        status: selectedApplication.status,
        feedback: feedbackText 
      })).unwrap();
      toast.success('Feedback submitted successfully');
      setShowFeedbackModal(false);
      setSelectedApplication(null);
      setFeedbackText('');
      if (projectId) {
        dispatch(fetchProjectById(projectId));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit feedback');
    }
  };

  const openFeedbackModal = (application) => {
    setSelectedApplication(application);
    setFeedbackText(application.feedback || '');
    setShowFeedbackModal(true);
  };

  const handleTagAdd = async () => {
    if (!newTag.trim() || !currentProject) return;
    
    const updatedTags = [...(currentProject.tags || []), newTag.trim()];
    try {
      await dispatch(updateProject({ 
        projectId: currentProject.id || currentProject._id, 
        projectData: { tags: updatedTags } 
      })).unwrap();
      setNewTag('');
      toast.success('Tag added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to add tag');
    }
  };

  const handleTagRemove = async (tagToRemove) => {
    if (!currentProject) return;
    
    const updatedTags = (currentProject.tags || []).filter(tag => tag !== tagToRemove);
    try {
      await dispatch(updateProject({ 
        projectId: currentProject.id || currentProject._id, 
        projectData: { tags: updatedTags } 
      })).unwrap();
      toast.success('Tag removed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to remove tag');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <HiOutlineBriefcase className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <HiOutlineDocumentCheck className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <HiOutlineXCircle className="w-4 h-4 text-red-500" />;
      default: return <HiOutlineBriefcase className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'blue';
      case 'in_progress': return 'yellow';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const isOwner = user?.role === 'company' && (
    (user?.id && currentProject?.company?.id && user.id === currentProject.company.id) ||
    (user?.id && (currentProject?.createdBy === user.id || currentProject?.created_by === user.id))
  );
  const isAssignedToTask = tasks.some(task => (task.assigned_to === user?.id || task.assigned_to?._id === user?.id));
  const canUploadFiles = user?.role === 'company' || user?.role === 'admin';

  if (projectId === 'new') {
    return (
      <div className="min-h-screen mt-8 bg-gradient-to-br h-[calc(100vh-90px)] from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
            <button 
              onClick={() => navigate('/dashboard/projects')}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-gray-700 text-indigo-700 dark:text-indigo-300 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <HiOutlineArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
              Create New Project
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ProjectForm
              onSubmit={async (data) => {
                const result = await import('../../api/projects').then(mod => mod.createProject(data));
                if (result && result.id) {
                  navigate(`/dashboard/projects/${result.id}`);
                }
              }}
              onCancel={() => navigate('/dashboard/projects')}
              submitText="Create Project"
            />
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading project...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-10 px-4">
      <div className="text-red-600 text-base sm:text-lg font-medium">{error}</div>
    </div>
  );
  
  if (!currentProject) return (
    <div className="text-center py-10 px-4">
      <div className="text-gray-600 text-base sm:text-lg">Project not found</div>
    </div>
  );

  return (
    <div className="min-h-screen h-[calc(100vh-90px)] mt-16 overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 sm:p-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-gray-700 text-indigo-700 dark:text-indigo-300 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <HiOutlineArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">
          {currentProject?.title || 'Project Details'}
        </h1>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 sm:top-16 z-10 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex overflow-x-auto scrollbar-hide">
        {['overview', 'tasks', 'files', isOwner ? 'applications' : null].filter(Boolean).map((tab, index) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium capitalize transition-all duration-200 border-b-2 whitespace-nowrap flex-shrink-0 ${
              tabValue === tab 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {tab === 'overview' && <HiOutlineEye className="w-4 h-4 mr-1 sm:mr-2" />}
            {tab === 'tasks' && <HiOutlineClipboardList className="w-4 h-4 mr-1 sm:mr-2" />}
            {tab === 'files' && <HiOutlineFolder className="w-4 h-4 mr-1 sm:mr-2" />}
            {tab === 'applications' && <HiOutlineUserGroup className="w-4 h-4 mr-1 sm:mr-2" />}
            <span className="hidden sm:inline">{tab}</span>
            <span className="sm:hidden">{tab === 'overview' ? 'Over' : tab === 'applications' ? 'Apps' : tab}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl h-[calc(100vh-90px)] overflow-y-auto mx-auto">
        {/* Overview Tab */}
        {tabValue === 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Project Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      {currentProject.title}
                    </h2>
                    <span className={`self-start inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      currentProject.status === 'open' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : currentProject.status === 'in_progress' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                          : currentProject.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {getStatusIcon(currentProject.status)}
                      <span className="hidden sm:inline">{currentProject.status.replace('_', ' ').toUpperCase()}</span>
                      <span className="sm:hidden">{currentProject.status.replace('_', ' ').slice(0, 3).toUpperCase()}</span>
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {currentProject.description}
                  </p>
                </div>

                {user?.role === 'freelancer' && (
                  <div className="flex-shrink-0">
                    {projectApplications.some(app => app.freelancer?._id === user?.id || app.freelancer?.id === user?.id) ? (
                      <button
                        disabled
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-xl cursor-not-allowed text-sm sm:text-base"
                      >
                        <HiOutlineCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Already Applied</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setApplyDialogOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
                      >
                        <HiOutlineUserAdd className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Apply Now</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Budget */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-5 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <div className="flex items-center gap-2 sm:gap-3 text-green-600 dark:text-green-400 mb-2">
                  <HiOutlineCurrencyDollar className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base font-medium">Budget</span>
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                  ₹{currentProject.budget?.toLocaleString('en-IN') || '0'}
                </div>
              </div>

              {/* Deadline */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 sm:p-5 rounded-xl border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <div className="flex items-center gap-2 sm:gap-3 text-orange-600 dark:text-orange-400 mb-2">
                  <HiOutlineClock className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base font-medium">Deadline</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                  {currentProject.deadline ? format(new Date(currentProject.deadline), 'MMM dd, yyyy') : 'Not specified'}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <HiOutlineTag className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                  {currentProject.tags?.length > 0 ? (
                    currentProject.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 rounded-full text-xs font-medium break-all"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">No tags added</span>
                  )}
                </div>
              </div>

              {/* Owner */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <HiOutlineUser className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Owner</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-2">
                  <img 
                    src={currentProject.owner?.photo || '/logo.svg'} 
                    alt="Owner" 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-indigo-200 dark:border-indigo-700 shadow flex-shrink-0" 
                  />
                  <span className="font-medium text-gray-800 dark:text-white text-sm sm:text-base truncate">
                    {currentProject.owner?.name || 'Company'}
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <HiOutlineCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Created</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                  {currentProject.createdAt ? format(new Date(currentProject.createdAt), 'MMM dd, yyyy, hh:mm a') : 'N/A'}
                </div>
              </div>

              {/* Updated Date */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <HiOutlineCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Last Updated</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                  {currentProject.updatedAt ? format(new Date(currentProject.updatedAt), 'MMM dd, yyyy, hh:mm a') : 'N/A'}
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <HiOutlineClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Tasks</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  {tasks.length}
                </div>
              </div>

              {/* Applicants */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <HiOutlineUserGroup className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Applicants</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  {projectApplications.length}
                </div>
              </div>

              {/* Company Name */}
              {currentProject.company?.name && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <HiOutlineOfficeBuilding className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-700 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Company</span>
                  </div>
                  <div className="font-medium text-gray-800 dark:text-white text-sm sm:text-base break-words">
                    {currentProject.company.name}
                  </div>
                </div>
              )}

              {/* Company Email */}
              {currentProject.company?.email && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <HiOutlineMail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Company Email</span>
                  </div>
                  <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 break-all">
                    {currentProject.company.email}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {Array.isArray(currentProject.files) && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <HiOutlineDocumentText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">Attachments</span>
                  </div>
                  <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                    {currentProject.files.length} file(s)
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Preview */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 mt-6 gap-2">
                <h3 className="text-2xl font-bold sm:text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  Project Analytics
                </h3>
                <button
                  onClick={() => setTabValue('analytics')}
                  className="px-3 py-1 text-xs sm:text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-700 dark:text-indigo-100 rounded-md transition-colors self-start sm:self-auto"
                >
                  
                </button>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 sm:p-4">
                <ProjectAnalytics project={currentProject} compact={true} />
              </div>
            </div>

            {/* Comments Preview */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <HiOutlineChatAlt2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0" />
                  Recent Comments
                </h3>
                <button
                  onClick={() => setTabValue('comments')}
                  className="px-3 py-1 text-xs sm:text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-700 dark:text-indigo-100 rounded-md transition-colors self-start sm:self-auto"
                >
                  View All
                </button>
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-1 sm:p-4">
                <CommentSection 
                  resourceType="project" 
                  resourceId={projectId} 
                  preview={true}
                  maxComments={3}
                  className="modern-comments-preview"
                />
              </div>
              </div>
              
            </div>
          </div>
        )}

        {/* Files Tab */}
        {tabValue === 'files' && currentProject?.id && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4">Project Files</h3>
              
              {canUploadFiles && (
                <FileUpload
                  multiple={true}
                  accept="*/*"
                  resourceType="project"
                  resourceId={currentProject.id}
                  onUploadComplete={() => {
                    dispatch(fetchProjectById(currentProject.id));
                    toast.success('Files uploaded successfully');
                  }}
                  className="mb-4 sm:mb-6"
                />
              )}

              {Array.isArray(currentProject.files) && currentProject.files.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base px-4">
                  No files uploaded yet.{canUploadFiles ? ' Upload files using the button above.' : ''}
                </div>
              ) : (
                <div className="mt-4">
                  {(() => {
                    const mappedFiles = currentProject.files.map(file => ({
                      ...file,
                      filename: file.filename,
                      url: file.url,
                      mimetype: file.mimetype,
                      size: file.size,
                    }));
                    return <FileViewer files={mappedFiles} title="Uploaded Files" />;
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {tabValue === 'tasks' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-2 sm:p-1">
              <TaskBoard projectId={projectId} />
            </div>
          </div>
        )}

        {/* Applications Tab (Owner) */}
        {tabValue === 'applications' && isOwner && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6">
              <ApplicationsList
                applications={Array.isArray(projectApplications) ? projectApplications : []}
                onStatusUpdate={handleApplicationStatus}
                onViewProfile={(freelancerId) => toast.info('Viewing freelancer profile...')}
                loading={loading}
                project={currentProject}
                refreshApplications={refreshApplications}
              />
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {tabValue === 'comments' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6">
              <CommentSection 
                resourceType="project" 
                resourceId={projectId} 
                className="professional-comments"
              />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {tabValue === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Project Analytics</h2>
              <ProjectAnalytics project={currentProject} />
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Application Dialog */}
      {applyDialogOpen && (
        <ApplicationForm
          open={applyDialogOpen}
          onClose={() => setApplyDialogOpen(false)}
          onSubmit={handleApplySubmit}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default ProjectDetail;