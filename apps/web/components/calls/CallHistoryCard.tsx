'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCallsPageStore } from '@/store/calls-page.store';
import { CallHistoryItem } from '@/types/calls.types';
import { Avatar } from '@/components/ui/Avatar';
import { format } from 'date-fns';
import { formatCallDuration } from '@vochatix/utils';
import { MoreHorizontal, PhoneCall, MessageSquare, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCalls } from '@/hooks/useCalls';

export function CallHistoryCard({ call, onHide }: { call: CallHistoryItem; onHide: () => void }) {
  const { user } = useAuthStore();
  const { selectedCallId, setSelectedCallId } = useCallsPageStore();
  const { initiateCall } = useCalls();
  const router = useRouter();
  
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isSelected = selectedCallId === call.id;
  const isGroup = call.conversation.type === 'GROUP';
  const isOutgoing = call.startedById === user?.id;
  
  // Determine user participant status
  const myParticipant = call.participants.find(p => p.userId === user?.id);
  const myStatus = myParticipant?.status;

  const isMissed = !isOutgoing && (myStatus === 'MISSED' || myStatus === 'REJECTED' || myStatus === 'RINGING');

  // Compute display info
  let displayName = '';
  let avatarUrl: string | null = null;
  let typeText = '';

  if (isGroup) {
    displayName = call.conversation.name || 'Group Call';
    avatarUrl = call.conversation.avatarUrl || null;
    typeText = isOutgoing ? 'Outgoing group call' : `Incoming from ${call.startedBy.name}`;
  } else {
    // Find the other person
    const otherUser = call.participants.find(p => p.userId !== user?.id)?.user || call.startedBy;
    displayName = otherUser.name;
    avatarUrl = otherUser.avatarUrl;
    
    if (isMissed) {
      typeText = 'Missed incoming';
    } else if (isOutgoing) {
      typeText = 'Outgoing';
    } else {
      typeText = 'Incoming';
    }
  }

  // Format date & duration
  const dateStr = format(new Date(call.startedAt || call.createdAt), 'dd-MM-yyyy');
  
  let durationStr = '--';
  if (call.startedAt && call.endedAt && !isMissed) {
    durationStr = formatCallDuration(new Date(call.startedAt), new Date(call.endedAt));
  }

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIds = call.participants.filter(p => p.userId !== user?.id).map(p => p.userId);
    initiateCall(call.conversationId, call.callType, targetIds);
    setShowMenu(false);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/chat/${call.conversationId}`);
    setShowMenu(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHide();
    setShowMenu(false);
  };

  return (
    <div 
      className={`relative w-full flex items-center px-4 py-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'
      }`}
      onClick={() => setSelectedCallId(call.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <Avatar name={displayName} avatarUrl={avatarUrl} size="md" />
      
      <div className="flex-1 min-w-0 ml-3">
        <p className={`text-sm font-semibold truncate ${isMissed ? 'text-red-600' : 'text-gray-900'}`}>
          {displayName}
        </p>
        <p className={`text-xs truncate ${isMissed ? 'text-red-500' : 'text-gray-500'}`}>
          {typeText}
        </p>
      </div>

      <div className="flex flex-col items-end text-xs text-gray-500 ml-2">
        {isHovered ? (
          <div className="relative">
            <button 
              className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-10 py-1" onClick={e => e.stopPropagation()}>
                <button onClick={handleCall} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <PhoneCall className="h-4 w-4 mr-2" /> Call Back
                </button>
                <button onClick={handleChat} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <MessageSquare className="h-4 w-4 mr-2" /> Chat
                </button>
                <button onClick={handleRemove} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" /> Remove from View
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <span>{dateStr}</span>
            {durationStr !== '--' && <span>{durationStr}</span>}
          </>
        )}
      </div>
    </div>
  );
}
