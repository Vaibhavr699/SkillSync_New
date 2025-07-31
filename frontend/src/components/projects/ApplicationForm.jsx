import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Paper,
  MenuItem
} from '@mui/material';
import {
  Close,
  Send,
  Description,
  AttachMoney,
  Schedule,
  Star
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import LoadingButton from '../common/LoadingButton';
import { toast } from 'react-hot-toast';

const ApplicationForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  project, 
  user,
  loading = false,
  error: externalError
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [submitError, setSubmitError] = useState(null);

  const validationSchema = Yup.object({
    coverLetter: Yup.string()
      .min(100, 'Cover letter must be at least 100 characters')
      .max(2000, 'Cover letter must be less than 2000 characters')
      .required('Cover letter is required'),
    proposedBudget: Yup.number()
      .min(1, 'Budget must be at least ₹1')
      .max(10000000, 'Budget must be less than ₹10,000,000')
      .nullable()
      .optional(),
    estimatedDuration: Yup.string()
      .nullable()
      .optional(),
    relevantExperience: Yup.string()
      .min(50, 'Please describe your relevant experience (at least 50 characters)')
      .max(1000, 'Experience description must be less than 1000 characters')
      .nullable()
      .optional()
  });

  const handleSubmit = async (values) => {
    setSubmitError(null);
    try {
      await onSubmit({
        coverLetter: values.coverLetter,
        ...(values.proposedBudget && { proposedBudget: values.proposedBudget }),
        ...(values.estimatedDuration && { estimatedDuration: values.estimatedDuration }),
        ...(values.relevantExperience && { relevantExperience: values.relevantExperience })
      });
      toast.success('Application submitted successfully!');
    } catch (err) {
      setSubmitError(err?.message || (typeof err === 'string' ? err : JSON.stringify(err)));
      toast.error(err?.message || (typeof err === 'string' ? err : 'Failed to submit application.'));
    }
  };

  const getInitialValues = () => ({
    coverLetter: '',
    proposedBudget: typeof project?.budget === 'number' ? project.budget : '',
    estimatedDuration: '',
    relevantExperience: ''
  });

  const durationOptions = [
    '1-3 days',
    '1 week',
    '2-3 weeks',
    '1 month',
    '2-3 months',
    '3-6 months',
    '6+ months'
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box>
          <Typography variant="h6">Apply to Project</Typography>
          <Typography variant="body2" color="text.secondary">
            {project?.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, isValid }) => (
          <Form>
            <DialogContent sx={{ pt: 3 }}>
              {/* Error message display */}
              {(submitError || externalError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError || externalError}
                </Alert>
              )}

              {/* Application Form */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Cover Letter */}
                <Field
                  as={TextField}
                  name="coverLetter"
                  label="Cover Letter"
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  error={touched.coverLetter && Boolean(errors.coverLetter)}
                  helperText={
                    (touched.coverLetter && errors.coverLetter) || 
                    `${values.coverLetter.length}/2000 characters`
                  }
                  placeholder="Introduce yourself and explain why you're the perfect fit for this project. Include your relevant experience, approach to the work, and why you're excited about this opportunity..."
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {/* Proposed Budget */}
                <Field
                  as={TextField}
                  name="proposedBudget"
                  label="Proposed Budget (₹)"
                  fullWidth
                  type="number"
                  variant="outlined"
                  error={touched.proposedBudget && Boolean(errors.proposedBudget)}
                  helperText={
                    (touched.proposedBudget && errors.proposedBudget) || 
                    (typeof project?.budget === 'number' ? `Original budget: ₹${project.budget.toLocaleString('en-IN')}` : '')
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>
                  }}
                />

                {/* Estimated Duration */}
                <Field
                  as={TextField}
                  name="estimatedDuration"
                  label="Estimated Duration"
                  fullWidth
                  select
                  variant="outlined"
                  error={touched.estimatedDuration && Boolean(errors.estimatedDuration)}
                  helperText={touched.estimatedDuration && errors.estimatedDuration}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <MenuItem value="">Select duration</MenuItem>
                  {durationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Field>

                {/* Relevant Experience */}
                <Field
                  as={TextField}
                  name="relevantExperience"
                  label="Relevant Experience"
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  error={touched.relevantExperience && Boolean(errors.relevantExperience)}
                  helperText={
                    (touched.relevantExperience && errors.relevantExperience) || 
                    `${(values.relevantExperience || '').length}/1000 characters`
                  }
                  placeholder="Describe your relevant experience for this project. Include specific technologies, methodologies, or similar projects you've worked on..."
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Box>

              {/* Tips */}
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Tips for a successful application:</strong>
                </Typography>
                <Typography variant="body2" component="ul" sx={{ mt: 1, mb: 0 }}>
                  <li>Be specific about your experience and skills</li>
                  <li>Explain your approach to the project</li>
                  <li>Provide realistic timeline and budget estimates</li>
                  <li>Show enthusiasm and professionalism</li>
                </Typography>
              </Alert>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={loading || isSubmitting}
                disabled={!values.coverLetter || values.coverLetter.length < 100}
                startIcon={<Send />}
              >
                Submit Application
              </LoadingButton>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ApplicationForm; 