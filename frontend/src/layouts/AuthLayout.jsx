import { Outlet } from 'react-router-dom';
import { Container, Box } from '@mui/material';

const AuthLayout = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Outlet />
      </Box>
    </Container>
  );
};

export default AuthLayout;
