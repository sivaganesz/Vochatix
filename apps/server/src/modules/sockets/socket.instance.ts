import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export function setSocketServer(io: Server) {
  ioInstance = io;
}

export function getSocketServer(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized yet');
  }
  return ioInstance;
}
