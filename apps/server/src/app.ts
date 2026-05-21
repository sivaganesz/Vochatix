import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import conversationRoutes from './modules/conversations/conversations.routes';
import messageRoutes from './modules/messages/messages.routes';
import callRoutes from './modules/calls/calls.routes';
import liveKitRoutes from './modules/livekit/livekit.routes';

export function createApp() {
  const app = express();

  // Global middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/conversations/:conversationId/messages', messageRoutes);
  app.use('/api/calls', callRoutes);
  app.use('/api/livekit', liveKitRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Centralized error handler
  app.use(errorMiddleware);

  return app;
}
