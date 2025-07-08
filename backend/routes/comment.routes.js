const express = require('express');
const router = express.Router();
const { 
  getComments, 
  createComment, 
  updateComment, 
  deleteComment,
  addCommentFile,
  removeCommentFile,
  likeComment,
  unlikeComment
} = require('../controllers/comment.controller.js');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// ===== COMMENT SYSTEM ROUTES =====

// GET all comments for a resource (project or task)
router.get('/', auth, getComments);

// POST create new comment
router.post('/', auth, upload.array('files'), createComment);

// PUT update comment (only by author)
router.put('/:commentId', auth, updateComment);

// DELETE comment (only by author or admin)
router.delete('/:commentId', auth, deleteComment);

// POST add file to comment
router.post('/:commentId/files', auth, upload.array('files'), addCommentFile);

// DELETE remove file from comment
router.delete('/:commentId/files/:fileId', auth, removeCommentFile);

// POST like a comment
router.post('/:commentId/like', auth, likeComment);

// DELETE unlike a comment
router.delete('/:commentId/like', auth, unlikeComment);

module.exports = router;