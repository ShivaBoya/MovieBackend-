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

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://movie-frontend-five-rho.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/movie-app';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/movies', movieRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/showtimes', require('./routes/showtimeRoutes'));

app.get('/', (req, res) => {
  res.send('Movie Management API is running...');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-showtime', (showtimeId) => {
    socket.join(showtimeId);
    console.log(`User ${socket.id} joined showtime ${showtimeId}`);
  });

  socket.on('request-seat', ({ showtimeId, seatId }) => {
    socket.to(showtimeId).emit('seat-locked', { seatId, userId: socket.id });
  });

  socket.on('structure-change', (data) => {
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('socketio', io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
