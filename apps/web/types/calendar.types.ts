export type CalendarViewMode = 'day' | 'workWeek' | 'week' | 'month';

export interface CalendarParticipant {
  userId: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  responseStatus: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'PENDING';
}

export interface CalendarEvent {
  id: string; // eventId
  title: string;
  description?: string;
  start: Date; // startDateTime
  end: Date; // endDateTime
  isPrivate?: boolean;
  isOnlineMeeting?: boolean;
  meetingUrl?: string;
  createdById?: string;
  participants?: CalendarParticipant[];
  calendarId?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
