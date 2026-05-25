'use client';

import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Lock, Video } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar.store';
import { EventContentArg } from '@fullcalendar/core';

export function MainCalendarGrid() {
  const calendarRef = useRef<FullCalendar>(null);
  const { selectedDate, viewMode, events } = useCalendarStore();

  // Sync external state changes (from sidebar/toolbar) to FullCalendar
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(selectedDate);
      
      // Map custom viewMode to FullCalendar views
      let fcView = 'timeGridWeek';
      if (viewMode === 'day') fcView = 'timeGridDay';
      else if (viewMode === 'week') fcView = 'timeGridWeek';
      else if (viewMode === 'month') fcView = 'dayGridMonth';
      
      if (calendarApi.view.type !== fcView) {
        calendarApi.changeView(fcView);
      }
    }
  }, [selectedDate, viewMode]);

  // Transform our store events to FullCalendar event objects
  const fcEvents = events.map(ev => ({
    id: ev.id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    extendedProps: {
      isPrivate: ev.isPrivate,
      isOnlineMeeting: ev.isOnlineMeeting,
    }
  }));

  // Custom Event Card Render
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { title, extendedProps } = eventInfo.event;
    const { isPrivate, isOnlineMeeting } = extendedProps;

    return (
      <div className="flex flex-col w-full h-full p-1 overflow-hidden">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center space-x-1 min-w-0">
            {isOnlineMeeting && <Video className="h-3 w-3 flex-shrink-0 text-white/90" />}
            <span className="font-semibold text-xs truncate leading-tight">{title}</span>
          </div>
          {isPrivate && <Lock className="h-3 w-3 flex-shrink-0 text-white/90 ml-1" />}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full p-4 overflow-auto custom-calendar-wrapper bg-white">
      <style>{`
        /* Hide default FullCalendar header */
        .fc-header-toolbar {
          display: none !important;
        }

        /* Styling to look more like Teams */
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f3f4f6;
        }
        .fc-col-header-cell {
          padding-top: 8px;
          padding-bottom: 8px;
          font-weight: 500;
          color: #4b5563;
        }
        .fc-col-header-cell-cushion {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .fc-day-today {
          background-color: transparent !important;
        }
        .fc-day-today .fc-col-header-cell-cushion {
          color: #2563eb;
        }
        
        /* Event styling */
        .fc-v-event {
          background-color: #3b82f6 !important;
          border-color: #2563eb !important;
          border-radius: 4px;
          color: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
        }
        .fc-v-event:hover {
          background-color: #2563eb !important;
        }
        .fc-timegrid-slot {
          height: 48px !important; /* Hourly slots height */
        }
        .fc-timegrid-slot-minor {
          border-top-style: dotted !important;
        }
        .fc-timegrid-axis-cushion {
          font-size: 11px;
          color: #6b7280;
        }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={fcEvents}
        eventContent={renderEventContent}
        eventClick={(info) => {
          const { setSelectedEventId } = useCalendarStore.getState();
          setSelectedEventId(info.event.id);
        }}
        
        // Work Week Configuration
        weekends={viewMode !== 'workWeek'} 
        firstDay={1} // Monday
        
        // Time Configuration
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        allDaySlot={false}
        
        // Formatting Day Headers
        dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
        
        height="100%"
        expandRows={true}
        nowIndicator={true}
      />
    </div>
  );
}
