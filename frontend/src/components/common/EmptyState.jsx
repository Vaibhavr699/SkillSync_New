import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const EmptyState = ({ 
  title, 
  description, 
  actionText, 
  onAction,
  icon: Icon
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        minHeight: '300px'
      }}
    >
      {Icon && (
        <Icon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;