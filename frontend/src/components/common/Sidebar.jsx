import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { useState } from 'react';
import { 
  HiOutlineSquares2X2,
  HiOutlineUserCircle,
  HiOutlineBuildingOffice2,
  HiOutlineFolder,
  HiOutlineClipboardDocumentList,
  HiOutlinePresentationChartLine,
  HiOutlineUserGroup,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineBars3,
  HiXMark
} from 'react-icons/hi2';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openProjects, setOpenProjects] = useState(false);
  const [openTasks, setOpenTasks] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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
    icons: {
      dashboard: HiOutlineSquares2X2,
      profile: HiOutlineUserCircle,
      company: HiOutlineBuildingOffice2,
      projects: HiOutlineFolder,
      tasks: HiOutlineClipboardDocumentList,
      analytics: HiOutlinePresentationChartLine,
      team: HiOutlineUserGroup,
      settings: HiOutlineCog6Tooth,
      logout: HiOutlineArrowRightOnRectangle
    }
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
    icons: {
      dashboard: HiOutlineSparkles,
      profile: HiOutlineAcademicCap,
      projects: HiOutlineLightBulb,
      tasks: HiOutlineRocketLaunch,
      applications: HiOutlineClipboardDocumentList,
      skills: HiOutlineShieldCheck,
      settings: HiOutlineCog6Tooth,
      logout: HiOutlineArrowRightOnRectangle
    }
  };

  // Admin-specific styling
  const adminConfig = {
    gradient: 'from-gray-700 via-gray-800 to-black',
    bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
    textColor: 'text-gray-900',
    accentColor: 'text-gray-700',
    hoverBg: 'hover:bg-gray-100',
    activeBg: 'bg-gray-200',
    activeText: 'text-gray-800',
    borderColor: 'border-gray-200',
    shadow: 'shadow-gray-100',
    icons: {
      dashboard: HiOutlineSquares2X2,
      users: HiOutlineUsers,
      projects: HiOutlineFolder,
      stats: HiOutlineChartBar,
      settings: HiOutlineCog6Tooth,
      logout: HiOutlineArrowRightOnRectangle
    }
  };

  const config = user?.role === 'company' ? companyConfig : 
                 user?.role === 'freelancer' ? freelancerConfig : 
                 adminConfig;

  const IconComponent = config.icons;

  return (
    <aside className={`
      hidden lg:block
      top-18 left-0 h-[calc(100vh-90rem)] w-64 bg-gradient-to-b from-indigo-900 via-indigo-800 to-blue-900 shadow-xl transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:static lg:translate-x-0 lg:transform-none lg:rounded-2xl lg:shadow-2xl lg:my-12 lg:mb-12 lg:w-64
    `}>
      {/* Enhanced Profile Section */}
      <div className={`p-6 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 text-white`}>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name?.charAt(0) || 'U'}&background=#1E1B4B&color=ffffff`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl border-4 border-white/10 shadow-xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-3 border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate">{user?.name}</h3>
            <p className="text-sm text-white/80 truncate">{user?.email}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                {user?.role === 'company' && <HiOutlineBuildingOffice2 className="w-3 h-3 mr-1" />}
                {user?.role === 'freelancer' && <HiOutlineAcademicCap className="w-3 h-3 mr-1" />}
                {user?.role === 'admin' && <HiOutlineShieldCheck className="w-3 h-3 mr-1" />}
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
            ${location.pathname === '/dashboard' 
              ? 'bg-indigo-700 dark:bg-indigo-800 text-white shadow-md' 
              : 'hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-900 dark:text-white'}
          `}
        >
          <IconComponent.dashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* Profile */}
        <Link 
          to="/dashboard/profile" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
            ${location.pathname === '/dashboard/profile' 
              ? 'bg-indigo-700 dark:bg-indigo-800 text-white shadow-md' 
              : 'hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-900 dark:text-white'}
          `}
        >
          <IconComponent.profile className="w-5 h-5" />
          <span>Profile</span>
        </Link>

        {/* Project Management - Company Only */}
        {user?.role === 'company' && (
          <Link 
            to="/dashboard/project-management" 
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
              ${location.pathname === '/dashboard/project-management' 
                ? 'bg-indigo-700 dark:bg-indigo-800 text-white shadow-md' 
                : 'hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-900 dark:text-white'}
            `}
          >
            <IconComponent.analytics className="w-5 h-5" />
            <span>Project Management</span>
          </Link>
        )}

        {/* Projects Section */}
        <Link 
          to="/dashboard/projects" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
            ${location.pathname === '/dashboard/projects' 
              ? 'bg-indigo-700 dark:bg-indigo-800 text-white shadow-md' 
              : 'hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-900 dark:text-white'}
          `}
        >
          <IconComponent.projects className="w-5 h-5" />
          <span>Projects</span>
        </Link>

        {/* Tasks Section */}
        {/* <div className="space-y-1">
          <button 
            onClick={() => setOpenTasks(!openTasks)} 
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${config.textColor} ${config.hoverBg} hover:shadow-md`}
          >
            <div className="flex items-center gap-4">
              <IconComponent.tasks className="w-5 h-5" />
              <span>Tasks</span>
            </div>
            <div className={`transform transition-transform duration-200 ${openTasks ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {openTasks && (
            <div className="ml-8 space-y-1 pl-4 border-l-2 border-dashed border-gray-300">
              <Link 
                to="/dashboard/tasks" 
                className={`block px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                  location.pathname === '/dashboard/tasks' 
                    ? `${config.activeBg} ${config.activeText}` 
                    : `${config.textColor} hover:bg-gray-100`
                }`}
              >
                My Tasks
              </Link>
              <Link 
                to="/dashboard/tasks/assigned" 
                className={`block px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                  location.pathname === '/dashboard/tasks/assigned' 
                    ? `${config.activeBg} ${config.activeText}` 
                    : `${config.textColor} hover:bg-gray-100`
                }`}
              >
                Assigned Tasks
              </Link>
            </div>
          )}
        </div> */}

        {/* Logout Button */}
        <div className="px-4 mt-6">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] border border-red-700"
          >
            <IconComponent.logout className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="space-y-1">
            <button 
              onClick={() => setOpenAdmin(!openAdmin)} 
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium group
                ${openAdmin ? 'bg-indigo-700 dark:bg-indigo-800 text-white shadow-md' : 'hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-900 dark:text-white'}
              `}
            >
              <div className="flex items-center gap-4">
                <IconComponent.users className="w-5 h-5" />
                <span>Admin</span>
              </div>
              <div className={`transform transition-transform duration-200 ${openAdmin ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {openAdmin && (
              <div className="ml-4 space-y-1">
                <Link to="/dashboard/admin/users" className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-900 dark:text-white">User Management</Link>
                <Link to="/dashboard/admin/projects" className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-900 dark:text-white">Project Management</Link>
                <Link to="/dashboard/admin/stats" className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-900 dark:text-white">Admin Stats</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hamburger Button for md and below (shows when sidebar is hidden) */}
      <div className="block lg:hidden fixed top-4 right-4 z-50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md bg-white shadow-md">
          <HiOutlineBars3 className="w-6 h-6 text-indigo-700" />
        </button>
      </div>

      {/* Close button on mobile */}
      <div className="lg:hidden absolute top-4 right-4">
        <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md bg-white shadow">
          <HiXMark className="w-6 h-6 text-red-500" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
