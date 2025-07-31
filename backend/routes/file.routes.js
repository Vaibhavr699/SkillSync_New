const express = require('express');
const router = express.Router();
const { 
  uploadFiles, 
  downloadFile, 
  deleteFile, 
  getFileInfo,
  getFilesByResource,
  updateFileMetadata
} = require('../controllers/file.controller.js');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const upload = require('../middleware/upload');

// ===== FILE MANAGEMENT ROUTES =====

// POST upload file(s)
router.post('/upload', auth, upload.array('files'), uploadFiles);

// GET download file
router.get('/:fileId/download', downloadFile);

// GET file information
router.get('/:fileId', auth, getFileInfo);

// PUT update file metadata
router.put('/:fileId', auth, updateFileMetadata);

// DELETE file
router.delete('/:fileId', auth, deleteFile);

// GET files by resource type and ID
router.get('/resource/:type/:id', auth, getFilesByResource);

module.exports = router;