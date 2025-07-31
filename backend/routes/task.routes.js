const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  reorderTasks,
  assignTask,
  updateTaskStatus,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  uploadTaskFile,
  getTaskAttachments,
  deleteTaskAttachment,
  getTaskComments,
  addTaskComment,
  getProjectTeam,
  testTaskCreation,
  searchTasks
} = require('../controllers/task.controller.js');

const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const upload = require('../middleware/upload');

// Debug middleware to log all requests to task routes
router.use((req, res, next) => {
  console.log('=== TASK ROUTE DEBUG ===');
  console.log('baseUrl:', req.baseUrl);
  console.log('originalUrl:', req.originalUrl);
  console.log('params:', req.params);
  next();
});

// Test route for debugging task creation
router.post('/test', auth, testTaskCreation);

// Global search for tasks (no project ID required)
router.get('/search', auth, searchTasks);

// ===== TASK MANAGEMENT ROUTES =====

// GET project team members for assignment - MUST come before /:taskId routes
router.get('/team', auth, getProjectTeam);

// GET all tasks for a project (with filtering)
router.get('/', auth, getTasks);

// POST create new task
router.post('/', auth, roles('company'), upload.array('files'), createTask);

// PUT reorder tasks (drag-and-drop) - must come before /:taskId routes
router.put('/reorder', auth, roles('company'), reorderTasks);

// GET single task details
router.get('/:taskId', auth, getTaskById);

// PUT update task
router.put('/:taskId', auth, roles('company'), upload.array('files'), updateTask);

// DELETE task
router.delete('/:taskId', auth, roles('company'), deleteTask);

// PUT assign task to user
router.put('/:taskId/assign', auth, roles('company'), assignTask);

// PUT update task status
router.put('/:taskId/status', auth, updateTaskStatus);

// ===== CHECKLIST ROUTES =====

// POST add checklist item
router.post('/:taskId/checklist', auth, addChecklistItem);

// PUT update checklist item
router.put('/:taskId/checklist/:itemId', auth, updateChecklistItem);

// DELETE checklist item
router.delete('/:taskId/checklist/:itemId', auth, roles('company'), deleteChecklistItem);

// ===== FILE ATTACHMENT ROUTES =====

// POST upload files to task
router.post('/:taskId/files', auth, upload.array('files'), uploadTaskFile);

// GET task attachments
router.get('/:taskId/files', auth, getTaskAttachments);

// DELETE remove file from task
router.delete('/:taskId/files/:attachmentId', auth, roles('company'), deleteTaskAttachment);

// ===== COMMENT ROUTES =====

// GET task comments
router.get('/:taskId/comments', auth, getTaskComments);

// POST add comment to task
router.post('/:taskId/comments', auth, upload.array('files'), addTaskComment);

module.exports = router;
