const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, getAllProjects, updateProjectStatus, getSystemStats, deleteUser, deleteProject, banUser, unbanUser, banProject, unbanProject } = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.get('/users', auth, roles('admin'), getAllUsers);
router.put('/users/:userId/status', auth, roles('admin'), updateUserStatus);
router.patch('/users/:userId/ban', auth, roles('admin'), banUser);
router.patch('/users/:userId/unban', auth, roles('admin'), unbanUser);
router.get('/projects', auth, roles('admin'), getAllProjects);
router.put('/projects/:projectId/status', auth, roles('admin'), updateProjectStatus);
router.patch('/projects/:projectId/ban', auth, roles('admin'), banProject);
router.patch('/projects/:projectId/unban', auth, roles('admin'), unbanProject);
router.get('/stats', auth, roles('admin'), getSystemStats);
router.delete('/users/:userId', auth, roles('admin'), deleteUser);
router.delete('/projects/:projectId', auth, roles('admin'), deleteProject);

module.exports = router;