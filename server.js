require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const movieRoutes = require('./routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie-app';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/showtimes', require('./routes/showtimeRoutes'));

// Base route
app.get('/', (req, res) => {
  res.send('Movie Management API is running...');
});

// Create HTTP Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a specific showtime room
  socket.on('join-showtime', (showtimeId) => {
    socket.join(showtimeId);
    console.log(`User ${socket.id} joined showtime ${showtimeId}`);
  });

  // Handle seat locking
  socket.on('request-seat', ({ showtimeId, seatId }) => {
    // Broadcast to others in the room that this seat is being selected
    // In a real app, you'd check DB first / use Redis for locks
    socket.to(showtimeId).emit('seat-locked', { seatId, userId: socket.id });
  });

  socket.on('structure-change', (data) => {
    // Placeholder for structure changes
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io to use in routes if needed (e.g. req.io = io middleware)
app.set('socketio', io);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
