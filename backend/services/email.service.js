const transporter = require('../config/email');
const { generateToken } = require('../config/jwt');
const db = require('../config/db');

// Get the correct frontend URL
const getClientUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5173';
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${getClientUrl()}/verify-email/${token}`;
  
  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to SkillSync!</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
        <p>If you didn't create an account with SkillSync, you can safely ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email) => {
  const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (user.rows.length === 0) {
    throw new Error('User not found');
  }

  const resetToken = generateToken(user.rows[0].id, '1h');
  await db.query(
    'INSERT INTO tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)',
    [user.rows[0].id, resetToken, 'password-reset', new Date(Date.now() + 60 * 60 * 1000)]
  );

  const resetUrl = `${getClientUrl()}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendApplicationSubmittedEmail = async (companyEmail, projectTitle, freelancerName, coverLetter) => {
  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: companyEmail,
    subject: `New Application for ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Application Received</h2>
        <p><strong>${freelancerName}</strong> has applied to your project: <strong>${projectTitle}</strong>.</p>
        <p><strong>Cover Letter/Proposal:</strong></p>
        <blockquote style="background:#f3f4f6;padding:10px;border-radius:5px;">${coverLetter}</blockquote>
        <p>Login to SkillSync to review and manage applications.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendApplicationStatusEmail = async (freelancerEmail, projectTitle, status, feedback) => {
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const feedbackSection = feedback 
    ? `<p><strong>Feedback:</strong></p><blockquote style="background:#f3f4f6;padding:10px;border-radius:5px;">${feedback}</blockquote>`
    : '';

  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: freelancerEmail,
    subject: `Your Application for ${projectTitle} was ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application ${statusText}</h2>
        <p>Your application for <strong>${projectTitle}</strong> was <strong>${status}</strong>.</p>
        ${feedbackSection}
        <p>Login to SkillSync to view details.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApplicationSubmittedEmail,
  sendApplicationStatusEmail
};