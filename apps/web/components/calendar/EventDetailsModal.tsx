'use client';

import React from 'react';
import { X, Clock, Users, Video, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useCalendarStore } from '@/store/calendar.store';

export function EventDetailsModal() {
  const { selectedEventId, setSelectedEventId, events, removeEvent } = useCalendarStore();

  const event = events.find(e => e.id === selectedEventId);

  if (!selectedEventId || !event) return null;

  const handleDelete = () => {
    removeEvent(event.id);
    setSelectedEventId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
              <Clock className="h-4 w-4" />
              <span>{format(event.start, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 ml-6">
              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
            </div>
          </div>
          <button 
            onClick={() => setSelectedEventId(null)}
            className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {event.isOnlineMeeting && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Vochatix Meeting</h3>
                <a href="#" className="text-sm text-blue-600 hover:underline">Click here to join the meeting</a>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Participants</span>
            </div>
            <div className="flex -space-x-2 ml-6">
              {/* Mock participants */}
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">ME</div>
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-semibold">AL</div>
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-semibold">JB</div>
            </div>
          </div>

          {event.description && (
            <div className="text-sm text-gray-700 border-t border-gray-100 pt-4">
              <p>{event.description}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button 
            onClick={handleDelete}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md shadow-sm hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Cancel Event</span>
          </button>
          <button 
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
