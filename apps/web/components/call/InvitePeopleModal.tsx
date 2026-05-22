'use client';

import { useState } from 'react';
import { Search, Check, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { User } from '@/types/chat.types';
import api from '@/lib/api';

interface InvitePeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userIds: string[]) => void;
  existingParticipantIds: string[];
}

export function InvitePeopleModal({
  isOpen,
  onClose,
  onInvite,
  existingParticipantIds,
}: InvitePeopleModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Map<string, User>>(new Map());

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      // Filter out people already in the call
      const users = (response.data.data.users as User[]).filter(
        (u) => !existingParticipantIds.includes(u.id)
      );
      setSearchResults(users);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(user.id)) {
        newMap.delete(user.id);
      } else {
        newMap.set(user.id, user);
      }
      return newMap;
    });
  };

  const handleInvite = () => {
    if (selectedUsers.size === 0) return;
    onInvite(Array.from(selectedUsers.keys()));
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers(new Map());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add People to Call">
      <div className="space-y-4">
        {/* Selected users badges */}
        {selectedUsers.size > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.from(selectedUsers.values()).map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
                <span>{u.name}</span>
                <button
                  onClick={() => toggleUserSelection(u)}
                  className="hover:text-blue-900 ml-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Search Results */}
        <div className="min-h-[120px] max-h-[200px] overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((u) => {
                const isSelected = selectedUsers.has(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleUserSelection(u)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar name={u.name} avatarUrl={u.avatarUrl} size="md" isOnline={u.isOnline} />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : searchQuery.length > 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">No users found</p>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 py-6">
              <Users className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Type to search for people to invite</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleInvite}
            disabled={selectedUsers.size === 0}
            className="w-full sm:w-auto"
          >
            Invite {selectedUsers.size > 0 ? `(${selectedUsers.size})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
