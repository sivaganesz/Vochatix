import { create } from 'zustand';
import { Conversation, Message } from '@/types/chat.types';

interface TypingUser {
  userId: string;
  conversationId: string;
}

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: TypingUser[];
  onlineUserIds: Set<string>;
  selectedProfileUserId: string | null;

  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  setActiveConversation: (id: string | null) => void;
  markConversationAsRead: (conversationId: string) => void;
  incrementUnreadCount: (conversationId: string) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addTypingUser: (userId: string, conversationId: string) => void;
  removeTypingUser: (userId: string, conversationId: string) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setSelectedProfileUserId: (userId: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: [],
  onlineUserIds: new Set(),
  selectedProfileUserId: null,

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations.filter((c) => c.id !== conversation.id)],
    })),

  updateConversation: (conversation) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === conversation.id ? conversation : c)),
    })),

  markConversationAsRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  incrementUnreadCount: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 } : c
      ),
    })),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (message) =>
    set((state) => {
      const existing = state.messages[message.conversationId] ?? [];
      // Prevent duplicates
      if (existing.some((m) => m.id === message.id)) return state;
      return {
        messages: {
          ...state.messages,
          [message.conversationId]: [...existing, message],
        },
      };
    }),

  addTypingUser: (userId, conversationId) =>
    set((state) => {
      const exists = state.typingUsers.some(
        (t) => t.userId === userId && t.conversationId === conversationId
      );
      if (exists) return state;
      return { typingUsers: [...state.typingUsers, { userId, conversationId }] };
    }),

  removeTypingUser: (userId, conversationId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter(
        (t) => !(t.userId === userId && t.conversationId === conversationId)
      ),
    })),

  setUserOnline: (userId) =>
    set((state) => {
      const updated = new Set(state.onlineUserIds);
      updated.add(userId);
      return { onlineUserIds: updated };
    }),

  setUserOffline: (userId) =>
    set((state) => {
      const updated = new Set(state.onlineUserIds);
      updated.delete(userId);
      return { onlineUserIds: updated };
    }),

  setSelectedProfileUserId: (userId) => set({ selectedProfileUserId: userId }),
}));
