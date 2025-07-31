import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Avatar, 
  Divider,
  Tabs,
  Tab,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  Badge
} from '@mui/material';
import { 
  CheckCircle, 
  Close, 
  Person, 
  Business, 
  Schedule,
  AttachMoney,
  Description,
  Email,
  Phone
} from '@mui/icons-material';
import { fetchCompanyApplications, updateApplication } from '../../store/slices/projectSlice';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const CompanyApplications = () => {
  const dispatch = useDispatch();
  const { companyApplications, loading, error } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    console.log('CompanyApplications: useEffect triggered');
    console.log('User:', user);
    console.log('User role:', user?.role);
    
    if (user?.role === 'company') {
      console.log('Dispatching fetchCompanyApplications');
      dispatch(fetchCompanyApplications());
    }
  }, [dispatch, user]);

  // Debug logging
  useEffect(() => {
    console.log('CompanyApplications state updated:');
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Company applications:', companyApplications);
    console.log('Company applications length:', companyApplications?.length);
  }, [loading, error, companyApplications]);

  // Group applications by project
  const applicationsByProject = companyApplications.reduce((acc, app) => {
    if (!acc[app.project_id]) {
      acc[app.project_id] = {
        project: {
          id: app.project_id,
          title: app.project_title
        },
        applications: []
      };
    }
    acc[app.project_id].applications.push(app);
    return acc;
  }, {});

  console.log('Applications by project:', applicationsByProject);

  const handleApplicationAction = async (applicationId, status) => {
    setSelectedApplication(companyApplications.find(app => app.id === applicationId));
    setActionType(status);
    setActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedApplication) return;

    try {
      await dispatch(updateApplication({
        projectId: selectedApplication.project_id,
        applicationId: selectedApplication.id,
        status: actionType,
        feedback: feedback.trim() || undefined
      }));

      if (actionType === 'accepted') {
        toast.success('Application accepted successfully!', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } else {
        toast.success('Application rejected successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }

      // Refresh applications
      dispatch(fetchCompanyApplications());
      setActionDialog(false);
      setSelectedApplication(null);
      setFeedback('');
    } catch (error) {
      toast.error('Failed to update application status. Please try again.', {
        position: "top-right",
        autoClose: 3456,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'accepted': return <CheckCircle />;
      case 'rejected': return <Close />;
      default: return <Schedule />;
    }
  };

  if (user?.role !== 'company') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to view this page. Only companies can access application management.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Applications</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading applications: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Box sx={{ minHeight: '70vh', maxHeight: '80vh', overflowY: 'auto', bgcolor: '#f3f4f6', borderRadius: 2, p: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Business color="primary" />
          Project Applications
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage applications from freelancers for your projects
        </Typography>

        {/* Debug info */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'yellow.100', borderRadius: 1 }}>
          <Typography variant="body2">
            Debug: Applications count: {companyApplications?.length || 0}
          </Typography>
          <Typography variant="body2">
            Debug: User role: {user?.role}
          </Typography>
          <Typography variant="body2">
            Debug: User ID: {user?.id}
          </Typography>
        </Box>

        {Object.keys(applicationsByProject).length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No applications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When freelancers apply to your projects, you'll see their applications here.
            </Typography>
          </Paper>
        ) : (
          <Box>
            <Tabs 
              value={selectedTab} 
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label={`All (${companyApplications.length})`} />
              <Tab 
                label={
                  <Badge 
                    badgeContent={companyApplications.filter(app => app.status === 'pending').length} 
                    color="warning"
                  >
                    Pending
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge 
                    badgeContent={companyApplications.filter(app => app.status === 'accepted').length} 
                    color="success"
                  >
                    Accepted
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge 
                    badgeContent={companyApplications.filter(app => app.status === 'rejected').length} 
                    color="error"
                  >
                    Rejected
                  </Badge>
                } 
              />
            </Tabs>

            <Grid container spacing={3}>
              {Object.values(applicationsByProject)
                .filter(projectGroup => {
                  if (selectedTab === 0) return true;
                  const statusMap = ['', 'pending', 'accepted', 'rejected'];
                  const targetStatus = statusMap[selectedTab];
                  return projectGroup.applications.some(app => app.status === targetStatus);
                })
                .map((projectGroup) => (
                  <div key={projectGroup.project.id} className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-indigo-700">
                        <Link to={`/dashboard/projects/${projectGroup.project.id}`} className="hover:underline">{projectGroup.project.title}</Link>
                      </h3>
                      <span className="text-xs px-2 py-1 rounded border border-indigo-200 text-indigo-700">{projectGroup.applications.length} application{projectGroup.applications.length !== 1 ? 's' : ''}</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {projectGroup.applications
                        .filter(app => {
                          if (selectedTab === 0) return true;
                          const statusMap = ['', 'pending', 'accepted', 'rejected'];
                          const targetStatus = statusMap[selectedTab];
                          return app.status === targetStatus;
                        })
                        .map((application) => (
                          <li key={application.id} className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar src={application.freelancer_photo || `https://ui-avatars.com/api/?name=${application.freelancer_name?.charAt(0) || 'U'}`} alt={application.freelancer_name} />
                              <div>
                                <span className="font-semibold">{application.freelancer_name}</span>
                                <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">{application.status}</span>
                                <div className="text-xs text-gray-400">Applied: {new Date(application.applied_at).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500 mt-1">{application.cover_letter || application.proposal || 'No proposal provided'}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {application.status === 'pending' && (
                                <>
                                  <button className="btn btn-success text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition" onClick={() => handleApplicationAction(application.id, 'accepted')}>Accept</button>
                                  <button className="btn btn-danger text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition" onClick={() => handleApplicationAction(application.id, 'rejected')}>Reject</button>
                                </>
                              )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </Grid>
          </Box>
        )}

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionType === 'accepted' ? 'Accept Application' : 'Reject Application'}
          </DialogTitle>
          <DialogContent>
            {selectedApplication && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to {actionType} the application from{' '}
                  <strong>{selectedApplication.freelancer_name}</strong> for{' '}
                  <strong>{selectedApplication.project_title}</strong>?
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Feedback (optional)"
                  placeholder={actionType === 'accepted' ? 'Welcome message or next steps...' : 'Reason for rejection...'}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog(false)}>Cancel</Button>
            <Button 
              onClick={confirmAction}
              variant="contained"
              color={actionType === 'accepted' ? 'success' : 'error'}
            >
              {actionType === 'accepted' ? 'Accept' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CompanyApplications; 