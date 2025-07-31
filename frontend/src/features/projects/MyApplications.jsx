import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyApplications } from '../../store/slices/projectSlice';
import { Box, Typography, Paper, Chip, Avatar, Button, LinearProgress, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Business, Schedule, CheckCircle, Close, Description } from '@mui/icons-material';
import ApplicationFeedback from '../../components/projects/ApplicationFeedback';

const statusColor = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
};

const statusIcon = {
  pending: <Schedule />,
  accepted: <CheckCircle />,
  rejected: <Close />,
};

const MyApplications = () => {
  const dispatch = useDispatch();
  const { myApplications, loading, error } = useSelector(state => state.projects);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Description color="primary" />
        My Applications
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track the status of your project applications
      </Typography>

      {(!myApplications || myApplications.length === 0) ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start applying to projects to see your applications here.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {myApplications.map(app => (
            <div key={app._id || app.id} className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-indigo-700 mb-1">
                    <Link to={`/dashboard/projects/${app.project_id}`} className="hover:underline">{app.project_title}</Link>
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500">{app.company_name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">{app.status}</span>
                    <span className="text-xs text-gray-400">Applied: {format(new Date(app.createdAt || app.applied_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Your Proposal:</span>
                <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-1 text-sm whitespace-pre-wrap">{app.proposal || app.cover_letter || 'No proposal provided'}</div>
              </div>
              <ApplicationFeedback application={app} />
            </div>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyApplications; 