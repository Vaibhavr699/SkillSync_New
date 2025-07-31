export const initializeApp = () => async (dispatch) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token with backend
        const response = await fetch('/api/auth/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const user = await response.json();
          dispatch(setCredentials({ user, token }));
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
        console.error('Token verification failed:', error);
      }
    }
  };
  
  export const checkAuthTimeout = (expirationTime) => (dispatch) => {
    setTimeout(() => {
      dispatch(logout());
    }, expirationTime * 1000);
  };