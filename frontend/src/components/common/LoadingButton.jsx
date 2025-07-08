import { Button, CircularProgress } from '@mui/material';

const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <Button
      disabled={loading}
      {...props}
      startIcon={loading ? <CircularProgress size={20} /> : props.startIcon}
    >
      {loading ? 'Processing...' : children}
    </Button>
  );
};

export default LoadingButton;