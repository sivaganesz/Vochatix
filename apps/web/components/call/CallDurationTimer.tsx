'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CallDurationTimerProps {
  startedAt: string | null;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CallDurationTimer({ startedAt }: CallDurationTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    const initialElapsed = Math.floor((Date.now() - start) / 1000);
    setSeconds(Math.max(0, initialElapsed));

    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) {
    return (
      <div className="flex items-center gap-1 text-gray-400 text-sm">
        <Clock className="h-3 w-3" />
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-white text-sm font-mono">
      <Clock className="h-3 w-3 text-gray-300" />
      <span>{formatDuration(seconds)}</span>
    </div>
  );
}
