'use client';

import { Phone, PhoneOff, Video } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Call } from '@/types/call.types';
import { useEffect, useState } from 'react';

interface CallingScreenProps {
  call: Call;
  onCancel: () => void;
}

export function CallingScreen({ call, onCancel }: CallingScreenProps) {
  const [seconds, setSeconds] = useState(0);
  const isVideo = call.callType === 'VIDEO';

  const callee = call.participants.find(
    (p) => p.userId !== call.startedById
  )?.user ?? call.startedBy;

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Card */}
      <div className="relative bg-gray-900 rounded-3xl shadow-2xl px-10 py-12 w-80 flex flex-col items-center gap-6">
        {/* Call type */}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          {isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          <span>{isVideo ? 'Video' : 'Audio'} Call</span>
        </div>

        {/* Callee */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar name={callee.name} avatarUrl={callee.avatarUrl} size="xl" />
            {/* Animated pulse rings */}
            <div className="absolute inset-0 rounded-full ring-4 ring-blue-500 ring-opacity-40 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{callee.name}</p>
            <p className="text-gray-400 text-sm mt-1 animate-pulse">Calling...</p>
          </div>
        </div>

        {/* Timer */}
        <p className="text-gray-500 text-xs font-mono">
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </p>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="h-16 w-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          title="Cancel call"
        >
          <PhoneOff className="h-7 w-7" />
        </button>
        <span className="text-gray-500 text-xs">Tap to cancel</span>
      </div>
    </div>
  );
}
