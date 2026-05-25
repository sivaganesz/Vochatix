import { create } from 'zustand';
import { CalendarEvent, CalendarViewMode } from '@/types/calendar.types';

interface CalendarStore {
  selectedDate: Date;
  viewMode: CalendarViewMode;
  events: CalendarEvent[];
  
  // UI State
  isCreateModalOpen: boolean;
  selectedEventId: string | null;
  isMeetNowModalOpen: boolean;
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  setIsCreateModalOpen: (isOpen: boolean) => void;
  setSelectedEventId: (id: string | null) => void;
  setIsMeetNowModalOpen: (isOpen: boolean) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  removeEvent: (id: string) => void;
}

// Initial mock events
const generateMockEvents = (): CalendarEvent[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createDate = (daysOffset: number, hours: number, minutes: number = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  return [
    {
      id: '1',
      title: 'Daily Standup',
      start: createDate(0, 10, 0),
      end: createDate(0, 10, 30),
      isOnlineMeeting: true,
    },
    {
      id: '2',
      title: 'Design Review',
      start: createDate(0, 14, 0),
      end: createDate(0, 15, 0),
    },
    {
      id: '3',
      title: '1:1 with Manager',
      start: createDate(1, 11, 0),
      end: createDate(1, 11, 30),
      isPrivate: true,
    },
    {
      id: '4',
      title: 'Team Weekly Sync',
      start: createDate(2, 13, 0),
      end: createDate(2, 14, 0),
      isOnlineMeeting: true,
    }
  ];
};

export const useCalendarStore = create<CalendarStore>((set) => ({
  selectedDate: new Date(),
  viewMode: 'workWeek',
  events: generateMockEvents(),
  isCreateModalOpen: false,
  selectedEventId: null,
  isMeetNowModalOpen: false,
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  setIsMeetNowModalOpen: (isOpen) => set({ isMeetNowModalOpen: isOpen }),
  
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  
  updateEvent: (id, updatedEvent) => set((state) => ({
    events: state.events.map(ev => ev.id === id ? { ...ev, ...updatedEvent } : ev)
  })),
  
  removeEvent: (id) => set((state) => ({
    events: state.events.filter(ev => ev.id !== id)
  })),
}));
