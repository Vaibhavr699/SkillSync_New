import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Badge,
  Alert,
  Tabs,
  Tab,
  Grid,
  Rating,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Message,
  Person,
  AttachMoney,
  Schedule,
  Star,
  MoreVert,
  Visibility,
  Email,
  Phone,
  LocationOn,
  Work,
  TrendingUp,
  TrendingDown,
  AccessTime,
  CheckCircleOutline,
  Feedback,
  FilterList,
  Sort,
  Search,
  Close
} from '@mui/icons-material';
import { format } from 'date-fns';
import LoadingButton from '../common/LoadingButton';
import { useDispatch } from 'react-redux';
import { fetchNotifications } from '../../store/slices/notificationSlice';

const ApplicationsList = ({ 
  applications = [], 
  onStatusUpdate, 
  onViewProfile,
  loading = false,
  project 
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAppId, setMenuAppId] = useState(null);
  const dispatch = useDispatch();

  const tabs = [
    { label: 'All', value: 'all', count: applications.length },
    { label: 'Pending', value: 'pending', count: applications.filter(app => !app.status).length },
    { label: 'Accepted', value: 'accepted', count: applications.filter(app => app.status === 'accepted').length },
    { label: 'Rejected', value: 'rejected', count: applications.filter(app => app.status === 'rejected').length }
  ];

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.proposal?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'budget':
          return (b.proposed_budget || 0) - (a.proposed_budget || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const handleStatusUpdate = async (applicationId, status, feedback = '') => {
    setActionLoading(true);
    try {
      await onStatusUpdate(applicationId, status, feedback);
      dispatch(fetchNotifications());
      setFeedbackDialog(false);
      setFeedbackText('');
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openFeedbackDialog = (application) => {
    setSelectedApplication(application);
    setFeedbackText(application.feedback || '');
    setFeedbackDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      default:
        return <AccessTime />;
    }
  };

  const getBudgetComparison = (proposed, original) => {
    if (!proposed || !original) return null;
    const diff = proposed - original;
    const percentage = (diff / original) * 100;
    
    if (diff === 0) return { type: 'neutral', text: 'Same as budget' };
    if (diff < 0) return { type: 'positive', text: `${Math.abs(percentage).toFixed(1)}% under budget` };
    return { type: 'negative', text: `${percentage.toFixed(1)}% over budget` };
  };

  const ApplicationCard = ({ application }) => {
    const budgetComparison = getBudgetComparison(application.proposed_budget, project?.budget);
    
    return (
      <Card sx={{ mb: 2, position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={application.photo} 
                sx={{ width: 56, height: 56 }}
              >
                {application.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {application.name}
                  {application.rating && (
                    <Rating value={application.rating} readOnly size="small" />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {application.skills?.join(', ')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Applied {format(new Date(application.created_at), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={getStatusIcon(application.status)}
                label={application.status || 'Pending'}
                color={getStatusColor(application.status)}
                variant={application.status ? 'filled' : 'outlined'}
              />
              {application.status === 'pending' && (
                <>
                  <Button
                    size="small"
                    color="success"
                    variant="contained"
                    sx={{ minWidth: 0, px: 2, ml: 1 }}
                    onClick={() => handleStatusUpdate(application.id, 'accepted')}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    sx={{ minWidth: 0, px: 2, ml: 1 }}
                    onClick={() => handleStatusUpdate(application.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney color="primary" fontSize="small" />
                <Typography variant="body2">
                  <strong>Proposed Budget:</strong> ₹{application.proposed_budget?.toLocaleString('en-IN')}
                </Typography>
              </Box>
              {budgetComparison && (
                <Chip
                  icon={budgetComparison.type === 'positive' ? <TrendingDown /> : <TrendingUp />}
                  label={budgetComparison.text}
                  color={budgetComparison.type === 'positive' ? 'success' : 'warning'}
                  size="small"
                  variant="outlined"
                />
              )}
            </Grid>
            <Grid>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="primary" fontSize="small" />
                <Typography variant="body2">
                  <strong>Duration:</strong> {application.estimated_duration}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>
            Cover Letter
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {application.proposal}
          </Typography>

          {application.relevant_experience && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Relevant Experience
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {application.relevant_experience}
              </Typography>
            </>
          )}

          {application.feedback && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Your Feedback:</strong> {application.feedback}
              </Typography>
            </Alert>
          )}
        </CardContent>

        {/* Accept/Reject buttons are now inline with the status chip at the top right */}
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Applications ({applications.length})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and manage applications for "{project?.title}"
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              select
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              InputProps={{
                startAdornment: <Sort fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            >
              <MenuItem value="date">Date Applied</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="budget">Budget</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              select
              label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              InputProps={{
                startAdornment: <FilterList fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          {tabs.map((tab, index) => (
            <Tab
              key={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.label}
                  <Badge badgeContent={tab.count} color="primary" />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Applications List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading applications...</Typography>
        </Box>
      ) : filteredApplications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Applications will appear here once freelancers apply to your project'
            }
          </Typography>
        </Paper>
      ) : (
        <Box>
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </Box>
      )}

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Feedback
          <IconButton
            onClick={() => setFeedbackDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide constructive feedback for {selectedApplication?.name}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Enter your feedback here..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <LoadingButton
            onClick={() => handleStatusUpdate(selectedApplication?.id, 'rejected', feedbackText)}
            variant="contained"
            color="error"
            loading={actionLoading}
            startIcon={<Cancel />}
          >
            Reject with Feedback
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationsList; 

export const ApplicationsCountCard = ({ count }) => {
  return (
    <div className="flex flex-col items-center justify-center h-24 w-full">
      <div className="flex items-center justify-center bg-indigo-800 text-white rounded-full w-12 h-12 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 16.5a7.488 7.488 0 00-5.982 2.225M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm6 2.25a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="ml-2 text-lg font-bold">{count}</span>
      </div>
      <span className="text-xs text-indigo-200">Applications</span>
    </div>
  );
}; 