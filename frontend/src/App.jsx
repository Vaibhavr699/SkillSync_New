import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './config/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store/store';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout.jsx';
import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/common/PrivateRoute';
import RoleRoute from './components/common/RoleRoute';
// Auth pages
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import VerifyEmail from './features/auth/VerifyEmail';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import CreateAdmin from './features/auth/CreateAdmin';
// Dashboard pages
import Dashboard from './features/dashboard/Dashboard';
import Profile from './features/dashboard/Profile';
import ProjectList from './features/dashboard/ProjectList';
import ProjectDetail from './features/dashboard/ProjectDetail';
import TaskBoard from './features/dashboard/TaskBoard';
import AIAssistant from './features/dashboard/AIAssistant.jsx';
import NotificationsDropdown from './components/notifications/NotificationsDropdown';
import CompanyDashboard from './features/dashboard/CompanyDashboard';
// Admin pages
import AdminDashboard from './features/admin/AdminDashboard';
import UserManagement from './features/admin/UserManagement';
import ProjectManagement from './features/admin/ProjectManagement';
import AdminStats from './features/admin/AdminStats';
// Other
import NotFound from './components/common/NotFound';
import UserProfile from './components/users/UserProfile';
import SearchPage from './features/search/SearchPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './features/home/HomePage';
import MyApplications from './features/projects/MyApplications';
import CompanyApplications from './features/projects/CompanyApplications';
import { useDispatch, useSelector } from 'react-redux';
import { checkCredentials } from './store/slices/authSlice';
import { useThemeContext } from './context/ThemeContext';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { mode, toggleTheme } = useThemeContext();

  useEffect(() => {
    dispatch(checkCredentials());
  }, [dispatch]);

  return (
    <Provider store={store}>
      <MuiThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
        <CssBaseline />
        <div className={mode === 'dark' ? 'dark' : ''}>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />
            {/* Redirect /projects/:projectId to /dashboard/projects/:projectId */}
            <Route path="/projects/:projectId" element={<RedirectProjectDetail />} />
            {/* Auth */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/create-admin" element={<CreateAdmin />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Main Dashboard (protected) */}
            <Route element={<PrivateRoute><MainLayout mode={mode} toggleTheme={toggleTheme} /></PrivateRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/projects" element={<ProjectList />} />
              <Route path="/dashboard/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/dashboard/tasks" element={<TaskBoard />} />
              <Route path="/dashboard/ai" element={<AIAssistant />} />
              <Route path="/dashboard/notifications" element={<NotificationsDropdown />} />
              <Route path="/dashboard/applications" element={<MyApplications />} />
              <Route path="/dashboard/company-applications" element={<CompanyApplications />} />
              <Route path="/dashboard/company" element={<CompanyDashboard />} />
              <Route path="/dashboard/project-management" element={<RoleRoute role="company"><ProjectManagement /></RoleRoute>} />
            </Route>


            {/* Admin (admin only) */}
            <Route element={<RoleRoute role="admin"><AdminLayout /></RoleRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/projects" element={<ProjectManagement />} />
              <Route path="/admin/stats" element={<AdminStats />} />
            </Route>

            {/* Public user profiles */}
            <Route path="/users/:userId" element={<UserProfile />} />

            {/* Global search */}
            <Route path="/search" element={<SearchPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={mode === 'dark' ? 'dark' : 'colored'}
            toastStyle={{
              borderRadius: '12px',
              background: mode === 'dark' ? '#23272f' : 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
              color: '#fff',
              fontWeight: 500,
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(30,60,114,0.15)'
            }}
            bodyStyle={{
              fontFamily: 'Poppins, sans-serif',
            }}
            icon={false}
          />
        </div>
      </MuiThemeProvider>
    </Provider>
  );
}

function RedirectProjectDetail() {
  const { projectId } = useParams();
  const location = useLocation();
  return <Navigate to={`/dashboard/projects/${projectId}${location.search}`} replace />;
}

export default App;