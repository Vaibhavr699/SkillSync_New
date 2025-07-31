// Enhanced Admin Layout and Dashboard with a Clean Black & White Theme

import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/admin' },
  { label: 'User Management', icon: <PeopleIcon />, to: '/admin/users' },
  { label: 'Project Management', icon: <WorkIcon />, to: '/admin/projects' },
];

const AdminLayout = () => {
  const location = useLocation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f9fafb' }}>
      <CssBaseline />

      {/* Sidebar */}
      

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, minHeight: '100vh', height: '100vh', overflowY: 'auto', bgcolor: '#fff' }}
      >
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: '#000',
            color: '#fff',
          }}
        >
          {/* <Toolbar>
            <Typography variant="h6" component="div" fontWeight="bold">
              Admin Dashboard
            </Typography>
          </Toolbar> */}
        </AppBar>

        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 4, md: 6 }, bgcolor: '#f9fafb' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
