import React from 'react';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { CalendarToolbar } from '@/components/calendar/CalendarToolbar';
import { MainCalendarGrid } from '@/components/calendar/MainCalendarGrid';
import { CreateEventModal } from '@/components/calendar/CreateEventModal';
import { EventDetailsModal } from '@/components/calendar/EventDetailsModal';
import { MeetNowModal } from '@/components/calendar/MeetNowModal';

export const metadata = {
  title: 'Calendar - Vochatix',
};

export default function CalendarPage() {
  return (
    <>
      <div className="flex h-full w-full bg-white overflow-hidden relative">
        {/* Left Sidebar */}
        <CalendarSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <CalendarToolbar />
          <div className="flex-1 relative overflow-hidden bg-white">
            <MainCalendarGrid />
          </div>
        </div>
      </div>
      
      {/* Modals outside the main flow to ensure proper z-index */}
      <CreateEventModal />
      <EventDetailsModal />
      <MeetNowModal />
    </>
  );
}
