const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const taskRoutes = require('./task.routes');
const commentRoutes = require('./comment.routes');
const fileRoutes = require('./file.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');
const aiRoutes = require('./ai.routes');

// ===== API ROUTE STRUCTURE =====

// Authentication routes
router.use('/auth', authRoutes);

// Project management routes
router.use('/projects', projectRoutes);

// Task management routes (project-specific)
router.use('/projects/:projectId/tasks', taskRoutes);

// Global task search route
router.use('/tasks', taskRoutes);

// Comment system routes (nested under projects only)
router.use('/projects/:projectId/comments', commentRoutes);

// File management routes
router.use('/files', fileRoutes);

// User management routes
router.use('/users', userRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// AI routes
router.use('/ai', aiRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router; 