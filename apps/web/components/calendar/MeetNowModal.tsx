'use client';

import React from 'react';
import { X, Video } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar.store';

export function MeetNowModal() {
  const { isMeetNowModalOpen, setIsMeetNowModalOpen } = useCalendarStore();

  if (!isMeetNowModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Start an instant meeting?</h2>
          <button 
            onClick={() => setIsMeetNowModalOpen(false)}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600">
            This will create a new instant meeting room. You can invite others once you join.
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button 
            onClick={() => setIsMeetNowModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              // Placeholder for actual LiveKit meeting integration
              setIsMeetNowModalOpen(false);
              alert("Meeting integration coming soon!");
            }}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            <Video className="h-4 w-4" />
            <span>Start meeting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
