import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Feedback, CheckCircle, Close } from '@mui/icons-material';

const ApplicationFeedback = ({ application }) => {
  if (!application.feedback) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle color="success" />;
      case 'rejected': return <Close color="error" />;
      default: return <Feedback />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2, border: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getStatusIcon(application.status)}
        <Typography variant="subtitle2" fontWeight="bold">
          Feedback from Company
        </Typography>
        <Chip
          label={application.status}
          color={getStatusColor(application.status)}
          size="small"
          variant="outlined"
        />
      </Box>
      <Typography variant="body2" sx={{ 
        whiteSpace: 'pre-wrap',
        backgroundColor: '#f8f9fa',
        padding: 1.5,
        borderRadius: 1,
        border: '1px solid #e9ecef'
      }}>
        {application.feedback}
      </Typography>
    </Paper>
  );
};

export default ApplicationFeedback; 