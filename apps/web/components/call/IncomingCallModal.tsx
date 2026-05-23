'use client';

import { Phone, PhoneOff, Video } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Call } from '@/types/call.types';

interface IncomingCallModalProps {
  call: Call;
  inviter?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallModal({ call, inviter, onAccept, onReject }: IncomingCallModalProps) {
  const caller = inviter || call.startedBy;
  const isVideo = call.callType === 'VIDEO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-80 flex flex-col items-center gap-6 animate-in zoom-in-95">
        {/* Call type indicator */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          {isVideo ? (
            <Video className="h-4 w-4 text-blue-600" />
          ) : (
            <Phone className="h-4 w-4 text-green-600" />
          )}
          Incoming {isVideo ? 'Video' : 'Audio'} Call
        </div>

        {/* Caller info */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar name={caller.name} avatarUrl={caller.avatarUrl} size="xl" />
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full ring-4 ring-blue-400 ring-opacity-50 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{caller.name}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-8">
          {/* Reject */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onReject}
              className="h-16 w-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <PhoneOff className="h-7 w-7" />
            </button>
            <span className="text-xs font-medium text-gray-600">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onAccept}
              className="h-16 w-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              {isVideo ? <Video className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
            </button>
            <span className="text-xs font-medium text-gray-600">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
