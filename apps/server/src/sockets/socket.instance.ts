import { Server } from 'socket.io';

const globalForSocket = globalThis as unknown as {
  ioInstance: Server | undefined;
};

let ioInstance: Server | null = globalForSocket.ioInstance ?? null;

export function setSocketServer(io: Server) {
  ioInstance = io;
  if (process.env.NODE_ENV !== 'production') {
    globalForSocket.ioInstance = io;
  }
}

export function getSocketServer(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized yet');
  }
  return ioInstance;
}
