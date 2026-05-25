'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  MoreHorizontal, 
  Video, 
  CalendarPlus, 
  ChevronDown
} from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, isSameMonth, addDays, subDays } from 'date-fns';
import { useCalendarStore } from '@/store/calendar.store';
import { CalendarViewMode } from '@/types/calendar.types';

export function CalendarToolbar() {
  const { selectedDate, setSelectedDate, viewMode, setViewMode, setIsCreateModalOpen } = useCalendarStore();

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handlePrev = () => {
    if (viewMode === 'day') setSelectedDate(subDays(selectedDate, 1));
    else if (viewMode === 'month') setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    else setSelectedDate(subWeeks(selectedDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setSelectedDate(addDays(selectedDate, 1));
    else if (viewMode === 'month') setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    else setSelectedDate(addWeeks(selectedDate, 1));
  };

  // Format the date range for the toolbar
  const getDateRangeDisplay = () => {
    if (viewMode === 'day') return format(selectedDate, 'dd MMMM, yyyy');
    if (viewMode === 'month') return format(selectedDate, 'MMMM yyyy');
    
    // For week / workWeek
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start for work week
    let end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    if (viewMode === 'workWeek') {
      end = addDays(start, 4); // Friday
    }

    if (isSameMonth(start, end)) {
      return `${format(start, 'dd')}–${format(end, 'dd MMMM, yyyy')}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'dd MMMM')} – ${format(end, 'dd MMMM, yyyy')}`;
    }
    return `${format(start, 'dd MMMM, yyyy')} – ${format(end, 'dd MMMM, yyyy')}`;
  };

  const views: { id: CalendarViewMode, label: string }[] = [
    { id: 'day', label: 'Day' },
    { id: 'workWeek', label: 'Work week' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
      {/* Left section: Navigation */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleToday}
          className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          Today
        </button>

        <div className="flex items-center">
          <button onClick={handlePrev} className="p-1 text-gray-500 hover:bg-gray-100 rounded-md">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={handleNext} className="p-1 text-gray-500 hover:bg-gray-100 rounded-md ml-1">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button className="flex items-center space-x-1 text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors">
          <span>{getDateRangeDisplay()}</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Right section: Actions */}
      <div className="flex items-center space-x-3">
        {/* View Selector Placeholder (Simplified as a select box for now) */}
        <div className="relative">
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as CalendarViewMode)}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-transparent hover:border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            {views.map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Filter Button */}
        <button className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
          <Filter className="h-4 w-4" />
          <span>Filter applied</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {/* More Options */}
        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
          <MoreHorizontal className="h-5 w-5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Meet Now */}
        <button 
          onClick={() => {
            const { setIsMeetNowModalOpen } = useCalendarStore.getState();
            setIsMeetNowModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors border border-gray-300 shadow-sm bg-white"
        >
          <Video className="h-4 w-4" />
          <span>Meet now</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* New Event */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          <span>New</span>
          <ChevronDown className="h-4 w-4 ml-1 opacity-80" />
        </button>
      </div>
    </div>
  );
}
