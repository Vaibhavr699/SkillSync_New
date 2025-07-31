const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, forgotPassword, resetPassword, refreshToken, createAdmin } = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimit');
const upload = require('../middleware/upload');

router.post('/register', upload.single('photo'), register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', authLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/create-admin', createAdmin);

module.exports = router;