import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { HiOutlineXMark } from 'react-icons/hi2';
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
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineBars3,
  HiOutlineChevronDown,
} from 'react-icons/hi2';
import { useState } from 'react';

const MobileSidebar = ({ open, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openAdmin, setOpenAdmin] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    onClose();
  };

  // You can copy the config logic from Sidebar if needed

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-blue-800 shadow-xl transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} block lg:hidden`}
      >
        {/* Profile Section (copied from Sidebar, mobile-optimized) */}
        <div className="p-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 text-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name?.charAt(0) || 'U'}&background=#1E1B4B&color=000000`}
                alt={user?.name}
                className="w-12 h-12 rounded-xl border-2 border-white/30 shadow object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold truncate">{user?.name}</h3>
              <p className="text-xs text-white/80 truncate">{user?.email}</p>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                  {user?.role === 'company' && <HiOutlineBuildingOffice2 className="w-3 h-3 mr-1" />}
                  {user?.role === 'freelancer' && <HiOutlineAcademicCap className="w-3 h-3 mr-1" />}
                  {user?.role === 'admin' && <HiOutlineShieldCheck className="w-3 h-3 mr-1" />}
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="p-2 rounded-md bg-white dark:bg-blue-900 shadow">
            <HiOutlineXMark className="w-6 h-6 text-red-500" />
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">
          <Link to="/dashboard" className="py-2 px-4 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center gap-2" onClick={onClose}>
            <HiOutlineSquares2X2 className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/dashboard/profile" className="py-2 px-4 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center gap-2" onClick={onClose}>
            <HiOutlineUserCircle className="w-5 h-5" /> Profile
          </Link>
          {/* Company Project Management */}
          {user?.role === 'company' && (
            <>
              <Link to="/dashboard/project-management" className="py-2 px-4 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center gap-2" onClick={onClose}>
                <HiOutlinePresentationChartLine className="w-5 h-5" /> Project Management
              </Link>
              <Link to="/dashboard/projects" className="py-2 px-4 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center gap-2" onClick={onClose}>
                <HiOutlineFolder className="w-5 h-5" /> Projects
              </Link>
            </>
          )}
          {/* Admin Project Management */}
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setOpenAdmin((v) => !v)}
                className="w-full flex items-center justify-between py-2 px-4 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900"
              >
                <span className="flex items-center gap-2">
                  <HiOutlineUsers className="w-5 h-5" /> Admin
                </span>
                <HiOutlineChevronDown className={`w-4 h-4 transition-transform ${openAdmin ? 'rotate-180' : ''}`} />
              </button>
              {openAdmin && (
                <div className="ml-6 flex flex-col gap-1">
                  <Link to="/dashboard/admin/users" className="py-1 px-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 text-sm" onClick={onClose}>
                    User Management
                  </Link>
                  <Link to="/dashboard/admin/projects" className="py-1 px-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 text-sm" onClick={onClose}>
                    Project Management
                  </Link>
                  <Link to="/dashboard/admin/stats" className="py-1 px-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 text-sm" onClick={onClose}>
                    Admin Stats
                  </Link>
                </div>
              )}
              <Link to="/dashboard/projects" className="py-2 px-4 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center gap-2" onClick={onClose}>
                <HiOutlineFolder className="w-5 h-5" /> Projects
              </Link>
            </>
          )}
          <button onClick={handleLogout} className="py-2 px-4 rounded bg-red-500 text-white mt-4 flex items-center gap-2 w-full justify-center">
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default MobileSidebar; 