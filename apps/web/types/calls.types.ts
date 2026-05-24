export interface CallHistoryItem {
  id: string;
  conversationId: string;
  roomName: string;
  callType: 'AUDIO' | 'VIDEO';
  status: 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'MISSED' | 'ENDED' | 'FAILED';
  startedById: string;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  
  conversation: {
    id: string;
    type: 'DIRECT' | 'GROUP';
    name?: string | null;
    avatarUrl?: string | null;
    members: {
      userId: string;
      user: {
        id: string;
        name: string;
        avatarUrl: string | null;
        designation: string | null;
        department: string | null;
      }
    }[];
  };

  startedBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
    designation: string | null;
    department: string | null;
  };

  participants: {
    id: string;
    userId: string;
    status: string;
    joinedAt: string | null;
    leftAt: string | null;
    isHidden: boolean;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
      designation: string | null;
      department: string | null;
    };
  }[];
}
