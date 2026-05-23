'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ParticipantsPopup } from '@/components/chat/ParticipantsPopup';
import { AddMembersModal } from '@/components/chat/AddMembersModal';
import { Spinner } from '@/components/ui/Spinner';
import { useMessages } from '@/hooks/useMessages';
import { useChatStore } from '@/store/chat.store';
import { useConversations } from '@/hooks/useConversations';
import { Conversation } from '@/types/chat.types';
import api from '@/lib/api';

// Next.js 14: params is a plain object, not a Promise
interface ConversationPageProps {
  params: { conversationId: string };
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = params;
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { typingUsers } = useChatStore();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoadingConv, setIsLoadingConv] = useState(true);

  const { messages, sendMessage, startTyping, stopTyping } = useMessages(conversationId);

  // Get typing users in this conversation (exclude self)
  const typingInThisConversation = typingUsers.filter(
    (t) => t.conversationId === conversationId && t.userId !== user?.id
  );

  // Get display names for typing users
  const typingUserNames = typingInThisConversation.map((t) => {
    const member = conversation?.members.find((m) => m.userId === t.userId);
    return member?.user.name ?? 'Someone';
  });

  const [activeTab, setActiveTab] = useState<'chat' | 'shared'>('chat');
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const { updateGroupName, leaveGroup } = useConversations();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchConversation = async () => {
      try {
        const response = await api.get(`/api/conversations/${conversationId}`);
        setConversation(response.data.data.conversation as Conversation);
        setNewGroupName(response.data.data.conversation.name || '');
      } catch {
        router.push('/chat');
      } finally {
        setIsLoadingConv(false);
      }
    };

    if (isAuthenticated) {
      fetchConversation();
    }
  }, [conversationId, isAuthenticated, authLoading, router]);

  // Sync conversation from store if it gets updated (e.g., members added)
  const storeConversation = useChatStore(state => state.conversations.find(c => c.id === conversationId));
  useEffect(() => {
    if (storeConversation) {
      setConversation(storeConversation);
      setNewGroupName(storeConversation.name || '');
    }
  }, [storeConversation]);

  // Mark messages as read when viewing the conversation
  useEffect(() => {
    if (isAuthenticated && messages.length > 0) {
      api.post(`/api/conversations/${conversationId}/messages/read`).catch(() => {});
      useChatStore.getState().markConversationAsRead(conversationId);
    }
  }, [messages.length, conversationId, isAuthenticated]);

  const handleEditGroup = async () => {
    if (newGroupName.trim() && newGroupName !== conversation?.name) {
      try {
        await updateGroupName(conversationId, newGroupName.trim());
        setIsEditNameOpen(false);
      } catch (err) {
        console.error(err);
      }
    } else {
      setIsEditNameOpen(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(conversationId);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || isLoadingConv) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!conversation || !user) return null;

  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
        <ChatHeader 
          conversation={conversation} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddMembers={() => setIsParticipantsOpen(true)}
          onEditGroup={() => setIsEditNameOpen(true)}
        />

        {activeTab === 'chat' ? (
          <>
            <MessageList
              messages={messages}
              currentUserId={user.id}
            />
            <TypingIndicator typingUserNames={typingUserNames} />
            <MessageInput
              onSend={sendMessage}
              onTypingStart={startTyping}
              onTypingStop={stopTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium text-lg">Shared files coming soon</p>
            <p className="text-gray-500 mt-1 max-w-sm">
              We&apos;re working on bringing file sharing and collaboration to your groups.
            </p>
          </div>
        )}
      </div>

      {isParticipantsOpen && (
        <ParticipantsPopup 
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          conversation={conversation}
          onAddMembers={() => setIsAddMembersOpen(true)}
          onLeaveGroup={handleLeaveGroup}
        />
      )}

      {/* Edit Group Name Modal */}
      {isEditNameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Edit Group Name</h3>
            <input 
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none mb-4"
              placeholder="Enter group name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditNameOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditGroup}
                disabled={!newGroupName.trim() || newGroupName === conversation.name}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-use an Add Members flow (to be built next) */}
      {isAddMembersOpen && (
        <AddMembersModal 
          isOpen={isAddMembersOpen}
          onClose={() => setIsAddMembersOpen(false)}
          conversation={conversation}
        />
      )}
    </ChatLayout>
  );
}
