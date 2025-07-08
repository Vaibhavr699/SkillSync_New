import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const RoleRoute = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  return children;
};

export default RoleRoute; 