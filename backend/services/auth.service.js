const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../config/jwt');
const { sendVerificationEmail, sendPasswordResetEmail, sendApplicationSubmittedEmail, sendApplicationStatusEmail } = require('./email.service');
const crypto = require('crypto');

const registerUser = async (email, password, role, name, skipVerification = false) => {
  // Check if user exists
  const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userExists.rows.length > 0) {
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let companyId = null;
  // If registering a company user, create/find company and set company_id
  if (role === 'company') {
    // Use company name as unique identifier (could be improved)
    let companyRes = await db.query('SELECT id FROM companies WHERE name = $1', [name]);
    if (companyRes.rows.length === 0) {
      companyRes = await db.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [name]);
    }
    companyId = companyRes.rows[0].id;
  }

  // Create user with verification status based on skipVerification
  const isVerified = skipVerification || role === 'admin';
  const newUser = await db.query(
    'INSERT INTO users (email, password, role, is_verified, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [email, hashedPassword, role, isVerified, companyId]
  );

  // Create profile
  await db.query(
    'INSERT INTO user_profiles (user_id, name) VALUES ($1, $2)',
    [newUser.rows[0].id, name]
  );

  // Only send verification email if not skipping verification
  if (!skipVerification) {
    // Generate verification token
    const verificationToken = generateToken(newUser.rows[0].id, '1d');
    await db.query(
      'INSERT INTO tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)',
      [newUser.rows[0].id, verificationToken, 'email-verification', new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);
  }

  return {
    id: newUser.rows[0].id,
    email: newUser.rows[0].email,
    role: newUser.rows[0].role,
    is_verified: newUser.rows[0].is_verified,
    company_id: newUser.rows[0].company_id
  };
};

const loginUser = async (email, password) => {
  const user = await db.query(`
    SELECT u.*, up.name
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.email = $1
  `, [email]);
  
  if (user.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.rows[0].password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  if (!user.rows[0].is_verified) {
    throw new Error('Please verify your email first');
  }

  if (!user.rows[0].is_active) {
    throw new Error('Account is deactivated');
  }

  // Remove any 2FA/OTP logic for admin users here
  // Always return tokens and user object for all users
  const accessToken = generateToken(user.rows[0].id, '1h');
  const refreshToken = generateToken(user.rows[0].id, '30d');

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.rows[0].id,
      email: user.rows[0].email,
      role: user.rows[0].role,
      name: user.rows[0].name,
    }
  };
};

module.exports = {
  registerUser,
  loginUser
};