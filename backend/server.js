require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool } = require('./config/db');
const path = require('path');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('PostgreSQL connection error:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

// API Routes - Use centralized route structure
app.use('/api', require('./routes/index'));

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3456;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io setup
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Join user-specific room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible in routes
app.set('io', io);

// Schedule a job to delete unverified users older than 2 minutes
cron.schedule('* * * * *', async () => {
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE is_verified = FALSE AND created_at < NOW() - INTERVAL '2 minutes' RETURNING id, email`
    );
    if (result.rows.length > 0) {
      console.log(`Deleted unverified users:`, result.rows.map(u => u.email));
    }
  } catch (err) {
    console.error('Error deleting unverified users:', err.message);
  }
});

module.exports = app;