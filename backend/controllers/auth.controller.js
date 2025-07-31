const { registerUser, loginUser, verifyAdminOtp } = require('../services/auth.service');
const { sendPasswordResetEmail } = require('../services/email.service');
const { generateToken } = require('../config/jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    
    if (!['admin', 'company', 'freelancer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    if (role === 'company' && (!name || name.trim() === '')) {
      return res.status(400).json({ message: 'Company name is required for company registration.' });
    }
    
    const user = await registerUser(email, password, role, name);
    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token exists and is valid
    const tokenRecord = await db.query(
      'SELECT * FROM tokens WHERE token = $1 AND type = $2 AND expires_at > NOW()',
      [token, 'email-verification']
    );
    
    if (tokenRecord.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Update user as verified
    await db.query(
      'UPDATE users SET is_verified = TRUE WHERE id = $1',
      [decoded.id]
    );
    
    // Delete the token
    await db.query('DELETE FROM tokens WHERE token = $1', [token]);
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginResult = await loginUser(email, password);
    // Always return normal login result (no 2fa step)
    const { accessToken, refreshToken, user } = loginResult;
    res.status(200).json({
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await sendPasswordResetEmail(email);
    
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token exists and is valid
    const tokenRecord = await db.query(
      'SELECT * FROM tokens WHERE token = $1 AND type = $2 AND expires_at > NOW()',
      [token, 'password-reset']
    );
    
    if (tokenRecord.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password
    await db.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, decoded.id]
    );
    
    // Delete the token
    await db.query('DELETE FROM tokens WHERE token = $1', [token]);
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const newAccessToken = generateToken(user.rows[0].id, '15m');
    
    res.status(200).json({
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Create admin user directly (no email verification required)
    const user = await registerUser(email, password, 'admin', name);
    
    res.status(201).json({
      message: 'Admin user created successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};