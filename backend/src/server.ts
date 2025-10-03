import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { generalLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import db from './database';
import { initializeWebSocketService } from './services/websocket';
import jwt from 'jsonwebtoken';
import { verifyToken } from './utils/auth';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Socket.IO for real-time sync
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle authentication and join user room
  socket.on('authenticate', async (token: string) => {
    try {
      if (!token) {
        socket.emit('auth-error', { message: 'No token provided' });
        return;
      }

      // Verify JWT token
      const decoded = verifyToken(token);
      const userId = decoded.userId;

      // Join user-specific room
      socket.join(`user:${userId}`);
      socket.data.userId = userId;
      
      console.log(`User ${userId} authenticated and joined their room`);
      socket.emit('authenticated', { userId });
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('auth-error', { message: 'Invalid token' });
    }
  });

  // Handle manual sync request
  socket.on('request-sync', () => {
    if (socket.data.userId) {
      socket.emit('sync-requested', { timestamp: new Date().toISOString() });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize WebSocket service
const wsService = initializeWebSocketService(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('Database connected successfully');

    // Run migrations
    await db.migrate.latest();
    console.log('Database migrations completed');

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    db.destroy();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    db.destroy();
    process.exit(0);
  });
});

startServer();