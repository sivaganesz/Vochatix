'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCallsPageStore } from '@/store/calls-page.store';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { formatCallDuration } from '@vochatix/utils';
import { X, MessageSquare, Phone, Video, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCalls } from '@/hooks/useCalls';
import api from '@/lib/api';

export function CallDetailsPanel() {
  const { user } = useAuthStore();
  const { selectedCallId, setSelectedCallId } = useCallsPageStore();
  const { history } = useCallHistory();
  const { initiateCall } = useCalls();
  const router = useRouter();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const call = history.find(c => c.id === selectedCallId);

  if (!call) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
        <p>Select a call to view details</p>
      </div>
    );
  }

  const isGroup = call.conversation.type === 'GROUP';
  const isOutgoing = call.startedById === user?.id;
  
  // Determine user participant status
  const myParticipant = call.participants.find(p => p.userId === user?.id);
  const myStatus = myParticipant?.status;
  const isMissed = !isOutgoing && (myStatus === 'MISSED' || myStatus === 'REJECTED' || myStatus === 'RINGING');

  let displayName = '';
  let avatarUrl: string | null = null;
  let subtitle = '';

  if (isGroup) {
    displayName = call.conversation.name || 'Group Call';
    avatarUrl = call.conversation.avatarUrl || null;
    subtitle = `${call.participants.length} participants`;
  } else {
    const otherUser = call.participants.find(p => p.userId !== user?.id)?.user || call.startedBy;
    displayName = otherUser.name;
    avatarUrl = otherUser.avatarUrl;
    subtitle = [otherUser.designation, otherUser.department].filter(Boolean).join(' - ') || 'Teammate';
  }

  const handleActionChat = () => {
    router.push(`/chat/${call.conversationId}`);
  };

  const handleActionCall = (type: 'AUDIO' | 'VIDEO') => {
    const targetIds = call.participants.filter(p => p.userId !== user?.id).map(p => p.userId);
    initiateCall(call.conversationId, type, targetIds);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSending(true);
    try {
      await api.post(`/api/conversations/${call.conversationId}/messages`, {
        text: messageText,
        type: 'TEXT'
      });
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const dateStr = format(new Date(call.startedAt || call.createdAt), 'dd MMMM yyyy');
  const startedTimeStr = call.startedAt ? format(new Date(call.startedAt), 'HH:mm') : '--:--';
  const endedTimeStr = call.endedAt ? format(new Date(call.endedAt), 'HH:mm') : '--:--';

  let displayCallType = '';
  let callAnswerStatus = '';

  if (isMissed) {
    displayCallType = 'Missed incoming';
    callAnswerStatus = 'Not answered';
  } else if (isOutgoing) {
    displayCallType = 'Outgoing';
    const answeredParticipant = call.participants.find(p => p.status === 'ACCEPTED' && p.userId !== user?.id);
    callAnswerStatus = answeredParticipant ? `Answered by ${answeredParticipant.user.name}` : 'Not answered';
  } else {
    displayCallType = 'Incoming';
    callAnswerStatus = 'Answered by you';
  }

  let durationStr = '--';
  if (call.startedAt && call.endedAt && !isMissed) {
    durationStr = formatCallDuration(new Date(call.startedAt), new Date(call.endedAt));
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Details</h2>
        <button onClick={() => setSelectedCallId(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center mt-4">
          <Avatar name={displayName} avatarUrl={avatarUrl} size="2xl" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{displayName}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {/* Action Icons */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button onClick={handleActionChat} className="flex flex-col items-center group">
            <div className="p-3 bg-gray-100 group-hover:bg-gray-200 rounded-full transition-colors">
              <MessageSquare className="h-5 w-5 text-gray-700" />
            </div>
            <span className="text-xs mt-2 text-gray-600 font-medium">Chat</span>
          </button>
          <button onClick={() => handleActionCall('AUDIO')} className="flex flex-col items-center group">
            <div className="p-3 bg-gray-100 group-hover:bg-gray-200 rounded-full transition-colors">
              <Phone className="h-5 w-5 text-gray-700" />
            </div>
            <span className="text-xs mt-2 text-gray-600 font-medium">Audio Call</span>
          </button>
          <button onClick={() => handleActionCall('VIDEO')} className="flex flex-col items-center group">
            <div className="p-3 bg-gray-100 group-hover:bg-gray-200 rounded-full transition-colors">
              <Video className="h-5 w-5 text-gray-700" />
            </div>
            <span className="text-xs mt-2 text-gray-600 font-medium">Video Call</span>
          </button>
        </div>

        {/* Quick Message */}
        <div className="mt-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Send a quick message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isSending || !messageText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Timeline Details */}
        <div className="mt-10 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{dateStr}</span>
          </div>
          <div className="p-4 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-medium ${isMissed ? 'text-red-600' : 'text-gray-900'}`}>{displayCallType}</p>
                <p className="text-xs text-gray-500 mt-1">{callAnswerStatus}</p>
              </div>
              <span className="text-sm text-gray-500">{startedTimeStr}</span>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900">Call ended</p>
              <span className="text-sm text-gray-500">{endedTimeStr}</span>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900">Total call time</p>
              <span className="text-sm font-semibold text-gray-900">{durationStr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
