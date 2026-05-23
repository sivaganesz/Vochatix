export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  dob?: string | null;
  bio?: string | null;
  socialLinks?: { platform: string; url: string }[] | null;
  isOnline: boolean;
  lastSeenAt: string | null;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  user: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  text: string | null;
  type: 'TEXT' | 'SYSTEM' | 'CALL';
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  members: ConversationMember[];
  messages: Message[];
  unreadCount?: number;
}
