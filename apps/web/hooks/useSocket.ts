'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';

export function useSocket(): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
  }, []);

  return socketRef.current ?? getSocket();
}
