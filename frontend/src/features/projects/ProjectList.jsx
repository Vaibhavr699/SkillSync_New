import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, addProject } from '../../store/slices/projectSlice';
import ProjectFilters from '../../components/projects/ProjectFilters';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  StarIcon,
  EyeIcon,
  BriefcaseIcon,
  CalendarIcon,
  TagIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import ProjectForm from '../../components/projects/ProjectForm';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';

const ProjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading, totalPages } = useSelector(state => state.projects);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    tags: [],
    minBudget: null,
    maxBudget: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useSelector(state => state.auth);
  const [createProjectDialog, setCreateProjectDialog] = useState(false);

  useEffect(() => {
    // Transform filters: remove empty values, flatten tags
    const filterParams = { ...filters };
    if (Array.isArray(filterParams.tags) && filterParams.tags.length > 0) {
      filterParams.tag = filterParams.tags;
    }
    delete filterParams.tags;
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] === '' || filterParams[key] == null || (Array.isArray(filterParams[key]) && filterParams[key].length === 0)) {
        delete filterParams[key];
      }
    });
    dispatch(fetchProjects({ page, limit: 10, search: searchTerm, ...filterParams }));
  }, [dispatch, page, searchTerm, filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setShowFilters(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'in-progress':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'completed':
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
      case 'cancelled':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const handleCreateProject = async (projectData) => {
    // Prepare tags as array
    const data = {
      ...projectData,
      tags: projectData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
    if (projectData.files) {
      projectData.files.forEach((fileObj) => {
        formData.append('files', fileObj.file);
      });
    }
    const resultAction = await dispatch(addProject(formData));
    if (addProject.fulfilled.match(resultAction)) {
      const newProject = resultAction.payload;
      setCreateProjectDialog(false);
      navigate(`/dashboard/projects/${newProject.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-indigo-950">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 dark:bg-indigo-900 dark:border-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Next Project</h1>
              <p className="mt-2 text-gray-600 dark:text-indigo-200">Discover opportunities that match your skills and expertise</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                  placeholder="Search projects by title, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                showFilters
                  ? 'border-black text-black bg-gray-100'
                  : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <ProjectFilters 
                initialFilters={filters}
                onApply={handleApplyFilters}
                onCancel={() => setShowFilters(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-220px)] overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from(new Array(6)).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="flex space-x-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {projects.length} of {totalPages * 10} projects
              </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => {
                // Determine if user is owner (company) or freelancer
                const isOwner = user?.role === 'company' && user?._id === project.company?._id;
                const isFreelancer = user?.role === 'freelancer';
                const hasApplied = project.applications?.some(app => app.freelancer?._id === user?._id);
                const myApplication = project.applications?.find(app => app.freelancer?._id === user?._id);
                return (
                  <div
                    key={project.id}
                    className="bg-gradient-to-br from-indigo-50 via-purple-50 to-emerald-50 dark:from-indigo-900 dark:via-indigo-800 dark:to-indigo-900 rounded-3xl shadow-xl border border-indigo-100 dark:border-indigo-800 hover:shadow-2xl transition-shadow duration-200 cursor-pointer group overflow-hidden"
                    onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  >
                    {/* Project Card Header */}
                    <div className="backdrop-blur bg-white/70 dark:bg-indigo-950/80 p-6 flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-extrabold text-indigo-800 dark:text-white group-hover:text-indigo-900 dark:group-hover:text-indigo-200 transition-colors duration-200 line-clamp-2 flex-1">
                          {project.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow ml-2
                          ${project.status === 'open' ? 'bg-blue-100 text-blue-700' :
                            project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                            project.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}
                        >
                          <span className="material-icons text-base">
                            {project.status === 'open' ? 'work_outline' :
                              project.status === 'in-progress' ? 'autorenew' :
                              project.status === 'completed' ? 'check_circle' : 'info'}
                          </span>
                          {project.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-indigo-100 text-sm mb-2 line-clamp-3">{project.description}</p>
                      {/* Meta Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-indigo-200">
                          <span className="material-icons text-indigo-400 dark:text-indigo-200">attach_money</span>
                          <span className="font-bold text-indigo-800 dark:text-indigo-200">₹{project.budget?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-indigo-200">
                          <span className="material-icons text-purple-400 dark:text-purple-200">event</span>
                          <span className="font-bold text-purple-800 dark:text-purple-200">{formatDate(project.deadline)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-indigo-200">
                          <span className="material-icons text-emerald-400 dark:text-emerald-200">business</span>
                          <span className="font-bold text-emerald-800 dark:text-emerald-200">{project.company?.name || 'Unknown Company'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-indigo-200">
                          <span className="material-icons text-pink-400 dark:text-pink-200">folder</span>
                          <span className="flex flex-wrap gap-1">
                            {project.tags?.length > 0 ? (
                              project.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200 px-2 py-0.5 rounded-full text-xs font-medium">#{tag}</span>
                              ))
                            ) : (
                              <span className="text-gray-400 dark:text-indigo-300">No tags</span>
                            )}
                            {project.tags?.length > 2 && (
                              <span className="text-gray-400 dark:text-indigo-300">+{project.tags.length - 2} more</span>
                            )}
                          </span>
                        </div>
                      </div>
                      {/* Owner: Applicant Count */}
                      {isOwner && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="material-icons text-indigo-400 dark:text-indigo-200">group</span>
                          <span className="text-xs text-indigo-700 dark:text-indigo-200 font-semibold">{project.applications?.length || 0} Applicants</span>
                        </div>
                      )}
                      {/* Freelancer: Apply Button or Status */}
                      {isFreelancer && (
                        <div className="mt-2">
                          {!hasApplied ? (
                            <button
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow hover:from-indigo-600 hover:to-purple-700 transition dark:bg-indigo-700 dark:hover:bg-indigo-800"
                              onClick={e => { e.stopPropagation(); navigate(`/dashboard/projects/${project.id}`); }}
                            >
                              <span className="material-icons align-middle mr-1">person_add</span> Apply
                            </button>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-1
                              ${myApplication?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                myApplication?.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                myApplication?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}
                            >
                              {myApplication?.status ? myApplication.status.charAt(0).toUpperCase() + myApplication.status.slice(1) : 'Applied'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Card Actions */}
                    <div className="flex gap-2 p-4 border-t border-indigo-50 dark:border-indigo-800 bg-white/60 dark:bg-indigo-900/80">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/dashboard/projects/${project.id}`); }}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-indigo-500 text-white font-semibold shadow hover:bg-indigo-600 transition dark:bg-indigo-700 dark:hover:bg-indigo-800"
                      >
                        <span className="material-icons text-base mr-1">visibility</span> View
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/dashboard/projects/${project.id}?tab=tasks`); }}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold shadow hover:bg-purple-200 transition dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800"
                      >
                        <span className="material-icons text-base">checklist</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {projects.length === 0 && !loading && (
              <div className="text-center py-12">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg ${
                          page === pageNum
                            ? 'border-black text-black bg-gray-100'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Remove the old 'Post a Project' button and add FAB */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            transform: 'scale(1.1)'
          },
          zIndex: 50
        }}
        onClick={() => setCreateProjectDialog(true)}
      >
        <AddIcon />
      </Fab>
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
    </div>
  );
};

export default ProjectList;