import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import MobileSidebar from '../components/common/MobileSidebar';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;
const navbarHeight = 64;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* Navbar with hamburger menu */}
      <Navbar onSidebarToggle={() => setMobileOpen(true)} />

      {/* Sidebar for large screens */}
      <Sidebar />

      {/* Mobile Sidebar for small/medium screens */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          m: 0,
          width: '100%',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
        className="bg-gradient-to-br from-indigo-200 via-blue-100 to-blue-300 w-full min-h-screen h-full"
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
