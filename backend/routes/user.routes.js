const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  getPublicProfile,
  getUserStats,
  updateUserSettings,
  changePassword,
  uploadProfilePhoto,
  deleteProfilePhoto,
  getUserById,
  searchUsers,
  getAllSkills,
  getUserImages,
  updateCompanyName,
  getCompanyById
} = require('../controllers/user.controller.js');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// ===== USER MANAGEMENT ROUTES =====

// GET all unique skills (must come before /:userId route)
router.get('/skills', getAllSkills);

// GET current user's profile
router.get('/profile', auth, getUserProfile);

// PUT update current user's profile
router.put('/profile', auth, updateUserProfile);

// GET user statistics
router.get('/stats', auth, getUserStats);

// PUT update user settings
router.put('/settings', auth, updateUserSettings);

// PUT change password
router.put('/change-password', auth, changePassword);

// POST upload profile photo
router.post('/profile-photo', auth, upload.single('photo'), uploadProfilePhoto);

// DELETE profile photo
router.delete('/profile-photo', auth, deleteProfilePhoto);

// GET user by ID (for internal use)
router.get('/:userId', auth, getUserById);

// GET public profile (no auth required)
router.get('/:userId/public', getPublicProfile);

// GET all users (search)
router.get('/', searchUsers);

// GET all images for a user
router.get('/:userId/images', auth, getUserImages);

// PATCH update company name
router.patch('/companies/:companyId/name', auth, updateCompanyName);

// GET company info by ID
router.get('/companies/:companyId', auth, getCompanyById);

module.exports = router;