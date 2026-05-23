'use client';

import { useState } from 'react';
import { Search, Users, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/auth.store';
import { User } from '@/types/chat.types';
import api from '@/lib/api';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (targetUserIds: string[], name: string) => Promise<void>;
}

export function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);

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

  const toggleUserSelection = (targetUser: User) => {
    if (selectedUsers.find(u => u.id === targetUser.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== targetUser.id));
    } else {
      setSelectedUsers([...selectedUsers, targetUser]);
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0 || !groupName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateGroup(selectedUsers.map(u => u.id), groupName.trim());
      handleClose();
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setGroupName('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Group Chat">
      <div className="space-y-4">
        {/* Group Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <input
            type="text"
            placeholder="E.g. Project X Team"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Members ({selectedUsers.length})</label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(u => (
                <div key={u.id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-full text-xs font-medium border border-blue-100">
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
                  <span>{u.name}</span>
                  <button onClick={() => toggleUserSelection(u)} className="hover:text-blue-900 ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Search */}
        <div className="relative pt-2 border-t border-gray-100">
          <Search className="absolute left-3 top-[1.35rem] h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users to add..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {searchResults.filter(u => u.id !== user?.id).map((u) => {
                const isSelected = !!selectedUsers.find(su => su.id === u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleUserSelection(u)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" isOnline={u.isOnline} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded border ${
                      isSelected ? 'bg-blue-500 border-blue-500 flex items-center justify-center' : 'border-gray-300'
                    }`}>
                      {isSelected && <X className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : searchQuery.length > 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">No users found</p>
          ) : (
            <p className="text-center text-sm text-gray-400 py-6 flex flex-col items-center gap-2">
              <Users className="h-8 w-8 opacity-20" />
              <span>Search and select users to create a group</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleCreate} 
            disabled={selectedUsers.length === 0 || !groupName.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
