const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId, expiresIn) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};