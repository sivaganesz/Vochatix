'use client';

import { useState, useRef, useEffect } from 'react';
import { Conversation } from '@/types/chat.types';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/date';
import { MoreVertical, BellOff, Mail, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConversationCardProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onMute: () => void;
  onMarkUnread: () => void;
  onRemove: () => void;
  details: { name: string; avatarUrl?: string | null; isOnline: boolean };
}

export function ConversationCard({
  conversation,
  isActive,
  onClick,
  onMute,
  onMarkUnread,
  onRemove,
  details
}: ConversationCardProps) {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const lastMessage = conversation.messages?.[0];
  const myMember = conversation.members?.find((m) => m.userId === user?.id);
  const isMuted = myMember?.isMuted || false;
  
  // A conversation is visually unread if it has an unreadCount OR if it is explicitly marked unread
  const isVisuallyUnread = (conversation.unreadCount && conversation.unreadCount > 0) || myMember?.isUnread;

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onMute();
  };

  const handleMarkUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onMarkUnread();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowConfirmModal(true);
  };

  const confirmRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmModal(false);
    onRemove();
  };

  const cancelRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmModal(false);
  };

  return (
    <>
      <div
        onClick={onClick}
        className={`group relative w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors text-left ${
          isActive ? 'bg-blue-50 hover:bg-blue-50' : ''
        } ${showMenu ? 'z-10' : ''}`}
      >
        <Avatar
          name={details.name}
          avatarUrl={details.avatarUrl}
          isOnline={details.isOnline}
          size="md"
        />
        
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center justify-between">
            <span className={`text-sm truncate flex items-center gap-1 ${isVisuallyUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
              {details.name}
              {isMuted && <BellOff className="h-3 w-3 text-gray-400" />}
            </span>
            {lastMessage && (
              <span className={`text-xs flex-shrink-0 ml-2 ${isVisuallyUnread ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
                {formatRelativeTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-0.5">
            <p className={`text-xs truncate pr-2 ${isVisuallyUnread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {lastMessage ? (
                lastMessage.type === 'CALL' ? `📞 ${lastMessage.text}` : lastMessage.text ?? ''
              ) : (
                ''
              )}
            </p>
            {isVisuallyUnread ? (
              <span className="flex-shrink-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none">
                {conversation.unreadCount || 1}
              </span>
            ) : null}
          </div>
        </div>

        {/* 3-dot Menu Button (visible on hover or when menu is open) */}
        <div className={`absolute right-2 top-1/2 -translate-y-1/2 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <button
            onClick={handleMenuClick}
            className={`p-1.5 rounded-md hover:bg-gray-200 text-gray-500 ${showMenu ? 'bg-gray-200' : ''}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Popup Menu */}
          {showMenu && (
            <div 
              ref={menuRef}
              className="absolute right-0 top-8 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleMute}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <BellOff className="h-4 w-4" />
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button 
                onClick={handleMarkUnread}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {myMember?.isUnread ? 'Mark as Read' : 'Mark as Unread'}
              </button>
              <button 
                onClick={handleRemoveClick}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-50 mt-1"
              >
                <Trash2 className="h-4 w-4" />
                Remove Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Remove Chat"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Remove this chat from your list? It will be hidden until a new message is sent.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={cancelRemove}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmRemove}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
