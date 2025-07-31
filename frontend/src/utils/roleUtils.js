export const hasPermission = (user, requiredRole) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === requiredRole;
  };
  
  export const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { color: 'error', label: 'Admin' };
      case 'company':
        return { color: 'primary', label: 'Company' };
      case 'freelancer':
        return { color: 'secondary', label: 'Freelancer' };
      default:
        return { color: 'default', label: 'Unknown' };
    }
  };