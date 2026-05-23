import http from 'http';
import { createApp } from './app';
import { createSocketServer } from './sockets/socket.server';
import { env } from '@vochatix/config';
import { logger } from '@vochatix/logger';
import { prisma } from '@vochatix/db';

async function main() {
  // Test database connection
  await prisma.$connect();
  logger.info('Database connected');

  const app = createApp();
  const httpServer = http.createServer(app);

  // Attach Socket.IO
  const io = createSocketServer(httpServer);
  logger.info('Socket.IO server initialized');

  // Start HTTP server
  const PORT = parseInt(env.PORT, 10);
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down server...');
    httpServer.close(async () => {
      await prisma.$disconnect();
      logger.info('Server shut down');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
