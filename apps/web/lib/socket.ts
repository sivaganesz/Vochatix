import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth-storage';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = getAuthToken();
  const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';

  socket = io(url, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    // Required for ngrok free tier tunneling
    extraHeaders: {
      'ngrok-skip-browser-warning': 'true',
    },
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
