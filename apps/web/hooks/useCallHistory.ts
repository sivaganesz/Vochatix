import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { CallHistoryItem } from '@/types/calls.types';

export function useCallHistory() {
  const [history, setHistory] = useState<CallHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/calls/history');
      setHistory(response.data.data.history);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch call history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hideCall = async (callId: string) => {
    try {
      await api.patch(`/api/calls/${callId}/remove-from-view`);
      setHistory(prev => prev.filter(c => c.id !== callId));
    } catch (err: any) {
      console.error('Failed to hide call:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, error, fetchHistory, hideCall };
}
