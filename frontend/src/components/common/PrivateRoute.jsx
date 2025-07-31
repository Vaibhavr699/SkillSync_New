import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { checkCredentials } from '../../store/slices/authSlice';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Check credentials on component mount
    dispatch(checkCredentials());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to access this page',
          from: window.location.pathname 
        } 
      });
    } else if (!loading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      navigate('/dashboard', { 
        state: { 
          message: `Access denied. ${requiredRole} role required.` 
        } 
      });
    }
  }, [isAuthenticated, user, requiredRole, loading, navigate]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={3}
      >
        <Typography variant="h5" color="text.primary">
          Authentication Required
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Please log in to access this page
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={3}
      >
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          You don't have permission to access this page.<br />
          {requiredRole} role is required.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  return children;
};

export default PrivateRoute;
