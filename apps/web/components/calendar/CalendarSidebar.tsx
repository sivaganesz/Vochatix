'use client';

import React, { useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  isWithinInterval
} from 'date-fns';
import { useCalendarStore } from '@/store/calendar.store';
import { cn } from '@/lib/cn';

export function CalendarSidebar() {
  const { selectedDate, setSelectedDate } = useCalendarStore();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(startOfMonth(day));
    }
  };

  const renderDays = () => {
    const dateFormat = 'eeeee'; // Narrow day of week (S, M, T...)
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-xs font-semibold text-gray-500 w-8 h-8 flex items-center justify-center">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="flex justify-between mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    // Calculate current selected week range to highlight it
    const selectedWeekStart = startOfWeek(selectedDate);
    const selectedWeekEnd = endOfWeek(selectedDate);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const isSelected = isSameDay(day, selectedDate);
        const inSelectedWeek = isWithinInterval(day, { start: selectedWeekStart, end: selectedWeekEnd });
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            className={cn(
              "w-8 h-8 flex items-center justify-center text-sm cursor-pointer rounded-full relative z-10",
              !isCurrentMonth ? "text-gray-300" : "text-gray-700",
              isToday && !isSelected && "font-bold text-blue-600 bg-blue-50",
              isSelected && "bg-blue-600 text-white font-semibold hover:bg-blue-700",
              !isSelected && "hover:bg-gray-100"
            )}
          >
            {/* Background highlight for the selected week */}
            {inSelectedWeek && !isSelected && isCurrentMonth && (
               <div className="absolute inset-0 bg-blue-50/50 -z-10 rounded-full" />
            )}
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-between mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="w-[300px] border-r border-gray-200 h-full flex flex-col bg-[#f5f5f5]">
      <div className="p-4 pt-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6 px-2">Calendar</h1>
        
        {/* Mini Calendar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-800 ml-1">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <div className="flex space-x-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          {renderDays()}
          {renderCells()}
        </div>

        {/* Add Calendar Button */}
        <button className="mt-4 w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors group">
          <CalendarPlus className="h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
          <span className="font-medium text-sm">Add calendar</span>
        </button>

        {/* My Calendars Section */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            My calendars
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-200/50 rounded-lg text-sm text-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="h-2 w-2 text-white" strokeWidth={3} />
                </div>
                <span>Calendar</span>
              </div>
            </button>
          </div>
          <button className="mt-3 px-3 text-xs text-blue-600 hover:underline">
            Show all
          </button>
        </div>
      </div>
    </div>
  );
}
