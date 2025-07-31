export const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };
  
  export const getAuthToken = () => {
    return localStorage.getItem('token');
  };
  
  export const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token;
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
  };