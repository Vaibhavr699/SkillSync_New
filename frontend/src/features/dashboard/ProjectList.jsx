import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, addProject } from '../../store/slices/projectSlice';
import { Link, useNavigate } from 'react-router-dom';
import ProjectFilters from '../../components/projects/ProjectFilters';
import { 
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineBuildingOffice2,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlinePresentationChartLine
} from 'react-icons/hi2';
import ProjectForm from '../../components/projects/ProjectForm';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, loading, totalPages } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    tags: [],
    minBudget: null,
    maxBudget: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [createProjectDialog, setCreateProjectDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'company' && (user?.id || user?._id)) {
      const userId = user.id || user._id;
      dispatch(fetchProjects({ page, search: searchTerm, ...filters, createdBy: userId }));
    } else if (user?.role === 'freelancer') {
      dispatch(fetchProjects({ page, search: searchTerm, ...filters }));
    }
  }, [dispatch, page, searchTerm, filters, user]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setShowFilters(false);
  };

  const handleCreateProject = async (projectData) => {
    // Prepare tags as array
    const data = {
      ...projectData,
      tags: Array.isArray(projectData.tags) ? projectData.tags : (projectData.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
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

  // Company-specific styling and icons
  const companyConfig = {
    gradient: 'from-indigo-600 via-purple-600 to-blue-600',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    textColor: 'text-indigo-900',
    accentColor: 'text-indigo-600',
    hoverBg: 'hover:bg-indigo-100',
    activeBg: 'bg-indigo-200',
    activeText: 'text-indigo-800',
    borderColor: 'border-indigo-200',
    shadow: 'shadow-indigo-100',
    cardBg: 'bg-white',
    cardHover: 'hover:shadow-indigo-200',
    buttonBg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    buttonHover: 'hover:from-indigo-700 hover:to-purple-700',
    icon: HiOutlineBuildingOffice2
  };

  // Freelancer-specific styling and icons
  const freelancerConfig = {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    textColor: 'text-emerald-900',
    accentColor: 'text-emerald-600',
    hoverBg: 'hover:bg-emerald-100',
    activeBg: 'bg-emerald-200',
    activeText: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    shadow: 'shadow-emerald-100',
    cardBg: 'bg-white',
    cardHover: 'hover:shadow-emerald-200',
    buttonBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    buttonHover: 'hover:from-emerald-700 hover:to-teal-700',
    icon: HiOutlineSparkles
  };

  const config = user?.role === 'company' ? companyConfig : freelancerConfig;
  const IconComponent = config.icon;

  // No client-side filtering needed; backend handles it
  const filteredProjects = projects;

  return (
    <div className="min-h-screen bg-gray-50 px-6 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
            <IconComponent className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'company' ? 'My Projects' : 'Available Projects'}
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'company' 
                ? 'Manage and track your project portfolio' 
                : 'Discover exciting opportunities that match your skills'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 ${showFilters ? 'bg-gray-100 border-gray-300' : ''}`}
            >
              <HiOutlineFunnel className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.tags.length > 0 || filters.status) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {filters.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                <HiOutlineTag className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => setFilters({...filters, tags: filters.tags.filter((_, i) => i !== index)})}
                  className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.status && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                <HiOutlineClock className="w-3 h-3" />
                {filters.status}
                <button
                  onClick={() => setFilters({...filters, status: ''})}
                  className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <ProjectFilters 
            initialFilters={filters}
            onApply={handleApplyFilters}
            onCancel={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Projects Grid */}
      <div className="relative">
        <div className="overflow-y-auto h-[calc(100vh-270px)] pr-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from(new Array(6)).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (!Array.isArray(filteredProjects) || filteredProjects.length === 0) ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center overflow-y-auto max-h-[70vh]">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} text-white mb-4`}>
                {user?.role === 'company' ? <HiOutlineBuildingOffice2 className="w-8 h-8" /> : <HiOutlineSparkles className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {user?.role === 'company' ? 'No projects yet' : 'No projects found'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {user?.role === 'company' 
                  ? 'Start building your project portfolio by creating your first project'
                  : 'Try adjusting your search criteria or check back later for new opportunities'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Array.isArray(filteredProjects) ? filteredProjects : []).map((project) => (
                  <div
                    key={project.id}
                    className={`${config.cardBg} dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden group cursor-pointer`}
                  >
                    <Link to={`/dashboard/projects/${project.id}`} className="block">
                      {/* Project Header */}
                      <div className={`p-6 bg-gradient-to-r ${config.gradient} text-white`}>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold line-clamp-2">{project.title}</h3>
                          <div className="flex-shrink-0">
                            <HiOutlineEye className="w-5 h-5 opacity-80" />
                          </div>
                        </div>
                        <p className="text-white/90 text-sm line-clamp-2">
                          {project.description?.substring(0, 120)}...
                        </p>
                      </div>

                      {/* Project Content */}
                      <div className="p-6">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(Array.isArray(project.tags) ? project.tags : []).slice(0, 3).map((tag, idx) => (
                            <span
                              key={tag + '-' + idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                            >
                              <HiOutlineTag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                          {project.tags?.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                              +{project.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Project Details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <HiOutlineCurrencyDollar className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">
                              ₹{project.budget?.toLocaleString('en-IN') || '0'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <HiOutlineClock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm">
                              {new Date(project.deadline).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          {project.applications && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <HiOutlineUserGroup className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">
                                {project.applications.length} applications
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          {user?.role === 'freelancer' ? (
                            <div
                              className={`w-full py-2 px-4 rounded-xl text-center text-sm font-semibold transition-all duration-200 ${config.buttonBg} text-white hover:shadow-lg transform hover:scale-105 cursor-pointer`}
                              onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
                            >
                              Apply Now
                            </div>
                          ) : user?.role === 'company' ? (
                            <div
                              className={`w-full py-2 px-4 rounded-xl text-center text-sm font-semibold transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:scale-105 cursor-pointer`}
                              onClick={() => window.location.href = `/dashboard/projects/${project.id}?tab=applications`}
                            >
                              View Applications
                            </div>
                          ) : (
                            <div
                              className={`w-full py-2 px-4 rounded-xl text-center text-sm font-semibold transition-all duration-200 bg-gray-200 text-gray-500 cursor-default`}
                            >
                              View Details
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          page === pageNum
                            ? `${config.buttonBg} text-white shadow-lg`
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Place FAB/modal here at the root, so it is not inside any flex or grid container */}
      {user?.role === 'company' && (
        <>
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
        </>
      )}
    </div>
  );
};

export default ProjectList;