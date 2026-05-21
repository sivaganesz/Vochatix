'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';

interface LiveKitToken {
  token: string;
  url: string;
  roomName: string;
}

export function useLiveKitToken() {
  const [tokenData, setTokenData] = useState<LiveKitToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async (callId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/livekit/token', { callId });
      const data = response.data.data as LiveKitToken;
      setTokenData(data);
      return data;
    } catch (err) {
      setError('Failed to get call token');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { tokenData, isLoading, error, fetchToken };
}
