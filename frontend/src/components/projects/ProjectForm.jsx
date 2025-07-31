import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Autocomplete,
  Chip,
  Typography,
  Grid,
  Paper,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
  DialogActions,
  Slider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  CloudUpload,
  Delete,
  AttachFile,
  Close,
  Add,
  AttachMoney,
  Visibility
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FileUpload from '../files/FileUpload';
import api from '../../api/api';

const ProjectForm = ({ 
  initialValues = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  submitText = "Create Project"
}) => {
  const [files, setFiles] = useState(initialValues?.files || []);
  const [uploading, setUploading] = useState(false);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    api.get('/users/skills').then(res => setAllTags(res.data || []));
  }, []);

  const defaultValues = {
    title: '',
    description: '',
    budget: '',
    deadline: '',
    tags: [],
    status: 'open',
    ...initialValues
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must be less than 2000 characters')
      .required('Description is required'),
    budget: Yup.number()
      .min(1, 'Budget must be at least ₹1')
      .required('Budget is required'),
    deadline: Yup.date()
      .min(new Date(), 'Deadline must be in the future')
      .required('Deadline is required'),
    tags: Yup.array()
      .of(Yup.string())
      .max(10, 'Maximum 10 tags allowed'),
    status: Yup.string()
      .oneOf(['open', 'in-progress', 'completed', 'cancelled'], 'Invalid status')
      .required('Status is required')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const projectData = {
        ...values,
        files: files.map(file => file.id || file._id || file)
      };
      
      await onSubmit(projectData);
      resetForm();
      setFiles([]);
    } catch (error) {
      console.error('Project submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (uploadedFiles) => {
    setUploading(true);
    try {
      // Add new files to the existing files array
      setFiles(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileToRemove) => {
    setFiles(prev => prev.filter(file => 
      (file.id || file._id) !== (fileToRemove.id || fileToRemove._id)
    ));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType, fileName) => {
    const extension = fileName ? fileName.split('.').pop()?.toLowerCase() : '';
    
    // Check by MIME type first
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.startsWith('video/')) return '🎥';
    if (mimeType?.startsWith('audio/')) return '🎵';
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('document') || mimeType?.includes('word')) return '📝';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return '📊';
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return '📈';
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('7z')) return '📦';
    if (mimeType?.includes('json') || mimeType?.includes('xml')) return '📋';
    if (mimeType?.includes('text/')) return '📄';
    
    // Check by file extension as fallback
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📈';
      case 'txt': return '📄';
      case 'csv': return '📊';
      case 'zip':
      case 'rar':
      case '7z': return '📦';
      case 'json':
      case 'xml': return '📋';
      case 'html':
      case 'css':
      case 'js': return '💻';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg': return '🖼️';
      default: return '📎';
    }
  };

  // Helper to format date as yyyy-MM-dd for input type="date"
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';
    return d.toISOString().slice(0, 10);
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
        <Form>
          <div>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-indigo-950 dark:to-indigo-900 min-h-full min-w-[320px] min-h-[400px] max-w-full">
              <div className="max-w-7xl w-full mx-auto">
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg border border-gray-100 dark:border-indigo-800 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <Field
                          as={TextField}
                          name="title"
                          label="Project Title"
                          fullWidth
                          variant="outlined"
                          error={touched.title && Boolean(errors.title)}
                          helperText={touched.title && errors.title}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '&:hover fieldset': {
                                borderColor: '#3b82f6',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#3b82f6',
                              },
                            },
                          }}
                          inputProps={{ 'aria-label': 'Project Title' }}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <Field
                          as={TextField}
                          name="description"
                          label="Project Description"
                          fullWidth
                          multiline
                          rows={4}
                          variant="outlined"
                          error={touched.description && Boolean(errors.description)}
                          helperText={touched.description && errors.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Describe your project requirements, goals, and expectations..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '&:hover fieldset': {
                                borderColor: '#3b82f6',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#3b82f6',
                              },
                            },
                          }}
                          inputProps={{ 'aria-label': 'Project Description' }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Budget & Timeline */}
                  <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg border border-gray-100 dark:border-indigo-800 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <AttachMoney className="text-green-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Budget & Timeline</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Typography gutterBottom>Budget (₹)</Typography>
                        <Slider
                          value={Number(values.budget) || 1000}
                          min={1000}
                          max={1000000}
                          step={1000}
                          onChange={(_, val) => setFieldValue('budget', val)}
                          valueLabelDisplay="auto"
                          aria-label="Budget Slider"
                          sx={{ mb: 2 }}
                        />
                        <Field
                          as={TextField}
                          name="budget"
                          label="Budget (₹)"
                          fullWidth
                          type="number"
                          variant="outlined"
                          error={touched.budget && Boolean(errors.budget)}
                          helperText={touched.budget && errors.budget}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          InputProps={{
                            startAdornment: <span className="text-gray-500 mr-2">₹</span>
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '&:hover fieldset': {
                                borderColor: '#3b82f6',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#3b82f6',
                              },
                            },
                          }}
                          inputProps={{ min: 1000, max: 1000000, 'aria-label': 'Budget' }}
                        />
                      </div>
                      <div>
                        <Field
                          as={TextField}
                          name="deadline"
                          label="Deadline"
                          fullWidth
                          type="date"
                          variant="outlined"
                          error={touched.deadline && Boolean(errors.deadline)}
                          helperText={touched.deadline && errors.deadline}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={formatDateForInput(values.deadline)}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '&:hover fieldset': {
                                borderColor: '#3b82f6',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#3b82f6',
                              },
                            },
                          }}
                          inputProps={{ 'aria-label': 'Deadline' }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Tags & Status */}
                  <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg border border-gray-100 dark:border-indigo-800 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Chip label="Tags" color="warning" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Tags & Status</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Autocomplete
                          multiple
                          freeSolo
                          options={allTags}
                          value={values.tags}
                          onChange={(event, newValue) => {
                            setFieldValue('tags', newValue);
                          }}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                variant="outlined"
                                label={option}
                                {...getTagProps({ index })}
                                key={option}
                                className="bg-blue-50 border-blue-200 text-blue-700"
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Tags"
                              placeholder="Add tags..."
                              error={touched.tags && Boolean(errors.tags)}
                              helperText={touched.tags && errors.tags}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px',
                                  '&:hover fieldset': {
                                    borderColor: '#3b82f6',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#3b82f6',
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <FormControl fullWidth error={touched.status && Boolean(errors.status)}>
                          <InputLabel>Status</InputLabel>
                          <Field
                            as={Select}
                            name="status"
                            label="Status"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            sx={{
                              borderRadius: '12px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                '&:hover': {
                                  borderColor: '#3b82f6',
                                },
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#3b82f6',
                              },
                            }}
                          >
                            <MenuItem value="open"><Chip label="Open" color="success" size="small" /></MenuItem>
                            <MenuItem value="in-progress"><Chip label="In Progress" color="info" size="small" /></MenuItem>
                            <MenuItem value="completed"><Chip label="Completed" color="primary" size="small" /></MenuItem>
                            <MenuItem value="cancelled"><Chip label="Cancelled" color="error" size="small" /></MenuItem>
                          </Field>
                        </FormControl>
                        {touched.status && errors.status && (
                          <span className="text-red-500 text-sm mt-1 block">
                            {errors.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Attachments */}
                  <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg border border-gray-100 dark:border-indigo-800 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <AttachFile className="text-purple-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-base">
                      You can upload files after creating the project.
                    </div>
                  </div>
                  {/* Live Preview */}
                  <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg border border-gray-100 dark:border-indigo-800 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Visibility className="text-indigo-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
                    </div>
                    <Paper elevation={2} className="p-4 rounded-xl bg-gray-50 dark:bg-indigo-800">
                      <Typography variant="h6" className="mb-2">{values.title || 'Project Title'}</Typography>
                      <Typography variant="body2" className="mb-2">{values.description || 'Project description will appear here.'}</Typography>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {values.tags && values.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" color="primary" />
                        ))}
                      </div>
                      <div className="flex gap-4 mb-2">
                        <Typography variant="caption">Budget: ₹{values.budget || '—'}</Typography>
                        <Typography variant="caption">Deadline: {values.deadline ? formatDateForInput(values.deadline) : '—'}</Typography>
                        <Typography variant="caption">Status: {values.status}</Typography>
                      </div>
                    </Paper>
                  </div>
                  {/* Action Buttons */}
                  <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                      <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={loading || isSubmitting}
                        className="border-gray-300 dark:bg-white text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-3"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || isSubmitting || uploading}
                        startIcon={loading || isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Add />}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl px-8 py-3"
                      >
                        {loading || isSubmitting ? 'Saving...' : submitText}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

ProjectForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  submitText: PropTypes.string
};

export default ProjectForm; 