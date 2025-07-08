const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware: Incoming headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware: Extracted token:', token);
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = verifyToken(token);
    const user = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = user.rows[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;