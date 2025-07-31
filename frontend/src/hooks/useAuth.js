import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

export const useAuth = (requiredRole = null) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (requiredRole && user?.role !== requiredRole) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return { user, isAuthenticated, handleLogout };
};