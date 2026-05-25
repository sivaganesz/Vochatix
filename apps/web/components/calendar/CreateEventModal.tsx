'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar.store';
import { CalendarEvent } from '@/types/calendar.types';

export function CreateEventModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, addEvent, selectedDate } = useCalendarStore();

  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [isOnline, setIsOnline] = useState(false);

  // Auto-fill date based on selectedDate when modal opens
  React.useEffect(() => {
    if (isCreateModalOpen && selectedDate) {
      // Format as YYYY-MM-DD for input
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDateStr(`${year}-${month}-${day}`);
    }
  }, [isCreateModalOpen, selectedDate]);

  if (!isCreateModalOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !dateStr || !timeStr) {
      alert('Please fill in title, date, and time.');
      return;
    }

    // Parse date and time
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    const start = new Date(year, month - 1, day, hours, minutes);
    // Default duration 1 hour
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substring(7),
      title: title.trim(),
      start,
      end,
      isOnlineMeeting: isOnline,
    };

    addEvent(newEvent);
    setIsCreateModalOpen(false);
    
    // Reset state
    setTitle('');
    setIsOnline(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New event</h2>
          <button 
            onClick={() => setIsCreateModalOpen(false)}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title" 
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input 
                type="time" 
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input 
              id="online" 
              type="checkbox" 
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label htmlFor="online" className="text-sm font-medium text-gray-700 select-none">Add online meeting</label>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
          <button 
            onClick={() => setIsCreateModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
