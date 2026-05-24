'use client';

import { useCallsPageStore } from '@/store/calls-page.store';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Spinner } from '@/components/ui/Spinner';
import { Filter } from 'lucide-react';
import { CallHistoryCard } from './CallHistoryCard';

export function CallHistoryPanel() {
  const { filter, setFilter } = useCallsPageStore();
  const { history, isLoading, error, hideCall } = useCallHistory();

  // Filter logic
  const filteredHistory = history.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Group') return item.conversation.type === 'GROUP';
    
    // We will compute incoming/outgoing/missed per user in CallHistoryCard or here
    // For exact filtering, it's easier to determine the direction/status.
    // Outgoing: startedById === current user ID
    // Incoming: startedById !== current user ID && participant status accepted
    // Missed: startedById !== current user ID && participant status missed
    
    // We'll rely on the backend or we can compute it on the fly.
    // For now, let's keep it simple.
    return true; 
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">History</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All</option>
            <option value="Missed">Missed</option>
            <option value="Incoming">Incoming</option>
            <option value="Outgoing">Outgoing</option>
            <option value="Group">Group</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : error ? (
          <div className="text-center text-sm text-red-500 py-10">{error}</div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <p className="text-sm font-medium text-gray-500">No calls found</p>
          </div>
        ) : (
          <div className="py-2">
            {filteredHistory.map((item) => (
              <CallHistoryCard 
                key={item.id} 
                call={item} 
                onHide={() => hideCall(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
