'use client';

import { useState } from 'react';
import { Search, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useCalls } from '@/hooks/useCalls';
import { useConversations } from '@/hooks/useConversations';
import { User } from '@/types/chat.types';
import api from '@/lib/api';

export function CallsSidebar() {
  const { initiateCall } = useCalls();
  const { createDirectConversation } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.data.users as User[]);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCall = async () => {
    if (!selectedUser) return;
    try {
      const conv = await createDirectConversation(selectedUser.id);
      initiateCall(conv.id, 'AUDIO', [selectedUser.id]);
    } catch (err) {
      console.error('Failed to start call', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Type a name"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <Button
          onClick={handleCall}
          disabled={!selectedUser}
          className="w-full flex items-center justify-center gap-2 py-2"
        >
          <Phone className="h-4 w-4" />
          <span>Call</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {selectedUser && searchQuery === '' && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Selected</p>
            <div className="flex items-center gap-3 px-2 py-2 bg-blue-50 rounded-md">
              <Avatar name={selectedUser.name} avatarUrl={selectedUser.avatarUrl} size="sm" isOnline={selectedUser.isOnline} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-xs text-blue-600 hover:text-blue-800">Clear</button>
            </div>
          </div>
        )}

        {searchQuery.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Results</p>
            {isSearching ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : searchResults.length > 0 ? (
              searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-md transition-colors text-left"
                >
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" isOnline={u.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500 px-2 py-4">No matching users found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
