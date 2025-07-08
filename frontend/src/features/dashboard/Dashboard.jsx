import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchTasks } from '../../store/slices/taskSlice';
import { 
  HiOutlineSquares2X2,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineBuildingOffice2,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineTag,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlinePresentationChartLine,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlinePlus
} from 'react-icons/hi2';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const fullName = user?.name;

  useEffect(() => {
    if (user) {
      dispatch(fetchProjects({ limit: 5 }));
      dispatch(fetchTasks());
    }
  }, [dispatch, user]);

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

  // Filter projects for company users to only show their own projects
  let filteredProjects = projects;
  if (user?.role === 'company' && Array.isArray(projects)) {
    const userId = user.id || user._id;
    filteredProjects = projects.filter(p => String(p.created_by) === String(userId));
  }

  if (!user || projectsLoading || tasksLoading) {
    return (
      <div className={`min-h-screen ${config.bgColor} dark:bg-gray-900 flex justify-center items-center`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} text-white mb-4 animate-pulse`}>
            <IconComponent className="w-8 h-8" />
          </div>
          <div className="text-gray-600 dark:text-gray-300">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  // Only show Projects card
  const stats = [
    {
      title: 'Projects',
      value: filteredProjects?.length || 0,
      icon: <HiOutlineSquares2X2 className="w-7 h-7" />,
      action: () => navigate('/dashboard/projects'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    // {
    //   title: 'Tasks',
    //   value: tasks?.length || 0,
    //   icon: <HiOutlineClipboardDocumentList className="w-7 h-7" />,
    //   action: () => navigate('/dashboard/tasks'),
    //   color: 'text-green-600',
    //   bgColor: 'bg-green-50'
    // },
    // {
    //   title: 'Connections',
    //   value: 0,
    //   icon: <HiOutlineUsers className="w-7 h-7" />,
    //   action: () => navigate('/dashboard/connections'),
    //   color: 'text-purple-600',
    //   bgColor: 'bg-purple-50'
    // },
    // {
    //   title: 'Company Dashboard',
    //   value: '',
    //   icon: <HiOutlineBuildingOffice2 className="w-7 h-7" />,
    //   action: () => navigate('/dashboard/company'),
    //   color: 'text-indigo-600',
    //   bgColor: 'bg-indigo-50'
    // }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-indigo-950 p-6 pt-18 h-[calc(100vh-90px)] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-700 scrollbar-track-transparent" style={{ marginTop: '56px' }}>
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 mb-4 text-center sm:text-left">
          <div className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-r ${config.gradient} text-white shadow-lg dark:bg-indigo-900 mb-2 sm:mb-0`}> 
            <IconComponent className="w-9 h-9 sm:w-10 sm:h-10" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, <span className={`font-extrabold ${config.accentColor} dark:text-indigo-l300`}>{fullName || 'User'}</span>
            </h1>
            <p className="text-gray-600 dark:text-indigo-200 mt-2 text-base sm:text-lg">
              {user?.role === 'company' 
                ? 'Here\'s what\'s happening with your projects today' 
                : 'Discover new opportunities and track your progress'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div
            key={stat.title || idx}
            onClick={stat.action}
            className={`${config.cardBg} dark:bg-indigo-900/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-100 dark:border-indigo-800 overflow-hidden group`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} dark:bg-indigo-800 dark:text-white`}>
                  {stat.icon}
                </div>
                <HiOutlineArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-indigo-300 dark:group-hover:text-white transition-colors duration-200`} />
              </div>
              <div>
                <div className="text-gray-500 dark:text-indigo-200 text-sm font-medium mb-1">{stat.title}</div>
                <div className={`text-3xl font-bold ${config.accentColor} dark:text-indigo-200`}>
                  {stat.value || 'View'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${config.textColor} dark:text-white mb-2`}>
              {user?.role === 'company' ? 'Your Recent Projects' : 'Featured Projects'}
            </h2>
            <p className="text-gray-600 dark:text-indigo-100">
              {user?.role === 'company' 
                ? 'Track the progress of your latest projects' 
                : 'Explore opportunities that match your skills'
              }
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/projects')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 ${config.buttonBg} ${config.buttonHover} shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <span>View All</span>
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>

        {Array.isArray(filteredProjects) && filteredProjects.length === 0 ? (
          <div className={`${config.cardBg} rounded-2xl shadow-lg p-12 text-center border border-gray-100`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} text-white mb-4`}>
              {user?.role === 'company' ? <HiOutlineBuildingOffice2 className="w-8 h-8" /> : <HiOutlineSparkles className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {user?.role === 'company' ? 'No projects yet' : 'No projects available'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {user?.role === 'company' 
                ? 'Ready to kickstart your journey? Head over to Project Management to create and manage your projects with powerful tools and analytics!'
                : 'Check back later for new opportunities that match your skills'
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredProjects || []).map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg flex flex-col h-full border border-gray-100 dark:border-indigo-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <div className="rounded-t-2xl p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white dark:bg-gradient-to-r dark:from-indigo-900 dark:via-indigo-800 dark:to-indigo-700 dark:text-white">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-200 dark:group-hover:text-indigo-300">
                    {project.title}
                  </h3>
                  <p className="mb-0 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <div className="p-6 flex flex-col flex-1 bg-white dark:bg-indigo-950 rounded-b-2xl">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={tag + '-' + idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium"
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
                      <span className="text-green-600 font-semibold text-sm dark:text-green-300">
                        ₹{project.budget?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <HiOutlineClock className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-500 text-sm ml-4 dark:text-indigo-100">
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
                    <div className={`w-full py-2 px-4 rounded-xl text-center text-sm font-semibold transition-all duration-200 ${config.buttonBg} text-white hover:shadow-lg transform hover:scale-105`}>
                      {user?.role === 'company' ? 'View Details' : 'Apply Now'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications Section */}
      {/**
      (user.role === 'freelancer' || user.role === 'company') && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${config.textColor} mb-2`}>
                {user.role === 'freelancer' ? 'Your Applications' : 'Recent Applications'}
                </h2>
              <p className="text-gray-600">
                {user.role === 'freelancer' 
                  ? 'Track the status of your project applications' 
                  : 'Review applications for your projects'
                }
              </p>
            </div>
            <button
              onClick={() => navigate(user.role === 'freelancer' ? '/dashboard/applications' : '/dashboard/company-applications')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 ${config.buttonBg} ${config.buttonHover} shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              <span>View All</span>
              <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          </div>

          {user.role === 'company' ? (
            companyApplications && companyApplications.length > 0 ? (
              <div className="space-y-6">
                {projects.map(project => {
                  const projectApps = companyApplications
                    .filter(app => app.project_id === project.id)
                    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
                  if (projectApps.length === 0) return null;
                  const recentApp = projectApps[0];
                  return (
                    <div key={project.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-blue-700 mb-1">{project.title}</div>
                        <div className="font-medium text-gray-900">{recentApp.freelancer_name}</div>
                        <div className="text-xs text-gray-500 mb-1">{recentApp.proposal?.slice(0, 80)}...</div>
                        <div className="text-xs text-gray-400">{new Date(recentApp.applied_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-700">{recentApp.status}</span>
                        <button
                          onClick={() => navigate(`/dashboard/projects/${project.id}?tab=applications`)}
                          className="px-4 py-2 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold text-xs"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  );
                }).filter(Boolean).slice(0, 5)}
              </div>
            ) : (
              <div className={`${config.cardBg} rounded-2xl shadow-lg p-8 text-center border border-gray-100`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} text-white mb-4`}>
                  <HiOutlineUserGroup className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications received</h3>
                <p className="text-gray-600 max-w-md mx-auto">Applications will appear here once freelancers start applying to your projects</p>
              </div>
            )
          ) : (
            <div className={`${config.cardBg} rounded-2xl shadow-lg p-8 text-center border border-gray-100`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${config.gradient} text-white mb-4`}>
                <HiOutlineAcademicCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">Start applying to projects that match your skills and interests</p>
            </div>
          )}
        </div>
      )
      */}
    </div>
  );
};

export default Dashboard;
