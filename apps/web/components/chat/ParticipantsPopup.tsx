'use client';

import { useState } from 'react';
import { Bot, UserPlus, LogOut, Check, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { User, Conversation } from '@/types/chat.types';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';

interface ParticipantsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  onAddMembers: () => void;
  onLeaveGroup: () => void;
}

export function ParticipantsPopup({
  isOpen,
  onClose,
  conversation,
  onAddMembers,
  onLeaveGroup,
}: ParticipantsPopupProps) {
  const { user } = useAuthStore();
  const { onlineUserIds } = useChatStore();
  
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Group chats might have many members. 
  const members = conversation.members;

  // Move current user to top if present
  const sortedMembers = [...members].sort((a, b) => {
    if (a.userId === user?.id) return -1;
    if (b.userId === user?.id) return 1;
    return 0;
  });

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeave = () => {
    setShowLeaveConfirm(false);
    onLeaveGroup();
    onClose();
  };

  const cancelLeave = () => {
    setShowLeaveConfirm(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`People (${members.length})`}>
      <div className="space-y-4">
        {/* Participants List */}
        <div className="max-h-[250px] overflow-y-auto space-y-1">
          {sortedMembers.map((member) => {
            const isMe = member.userId === user?.id;
            const isOnline = onlineUserIds.has(member.userId);
            
            return (
              <div 
                key={member.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={member.user.name} 
                    avatarUrl={member.user.avatarUrl} 
                    size="sm" 
                    isOnline={isOnline} 
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.name} {isMe && <span className="text-xs text-gray-400 font-normal ml-1">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-2">
          {/* Add People */}
          <button
            onClick={() => {
              onClose();
              onAddMembers();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left text-gray-700"
          >
            <div className="bg-gray-100 p-1.5 rounded-full">
              <UserPlus className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Add People</span>
          </button>

          {/* AI Agent (Disabled) */}
          <button
            disabled
            className="w-full flex items-center gap-3 p-2 rounded-lg opacity-50 cursor-not-allowed text-left text-gray-700"
          >
            <div className="bg-gray-100 p-1.5 rounded-full">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Add AI Agent</span>
              <span className="text-[10px] text-gray-500">Coming soon</span>
            </div>
          </button>

          {/* Leave Button */}
          {conversation.messages.length > 0 && (
            <div className="pt-2 mt-2 border-t border-gray-100">
              {!showLeaveConfirm ? (
                <button
                  onClick={handleLeaveClick}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-left"
                >
                  <div className="bg-red-100 p-1.5 rounded-full">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Leave Group</span>
                </button>
              ) : (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <p className="text-sm text-red-800 font-medium mb-3">
                    Are you sure you want to leave this group?
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1 text-gray-600 hover:bg-gray-200" onClick={cancelLeave}>
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={confirmLeave}>
                      <Check className="h-4 w-4 mr-2" /> Leave
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
