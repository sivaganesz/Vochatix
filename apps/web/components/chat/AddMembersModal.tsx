'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { User, Conversation } from '@/types/chat.types';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { useConversations } from '@/hooks/useConversations';
import api from '@/lib/api';

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
}

export function AddMembersModal({ isOpen, onClose, conversation }: AddMembersModalProps) {
  const { user } = useAuthStore();
  const { onlineUserIds } = useChatStore();
  const { addGroupMembers } = useConversations();
  
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedUserIds(new Set());
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        const allUsers = response.data.data.users as User[];
        // Filter out current user and existing members
        const existingMemberIds = new Set(conversation.members.map(m => m.userId));
        setUsers(allUsers.filter((u) => u.id !== user?.id && !existingMemberIds.has(u.id)));
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, [isOpen, user?.id, conversation.members]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedUserIds.size === 0) return;
    
    setIsSubmitting(true);
    try {
      await addGroupMembers(conversation.id, Array.from(selectedUserIds));
      onClose();
    } catch (error) {
      console.error('Failed to add members', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add people">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Selected Users Chips */}
        {selectedUserIds.size > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {Array.from(selectedUserIds).map((id) => {
              const selectedUser = users.find((u) => u.id === id);
              if (!selectedUser) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100"
                >
                  <Avatar name={selectedUser.name} avatarUrl={selectedUser.avatarUrl} size="sm" />
                  {selectedUser.name}
                  <button
                    onClick={() => toggleUser(id)}
                    className="hover:bg-blue-200 p-0.5 rounded-full transition-colors ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* User List */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">No users found</p>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedUserIds.has(u.id);
              const isOnline = onlineUserIds.has(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggleUser(u.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" isOnline={isOnline} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-transparent'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={selectedUserIds.size === 0 || isSubmitting}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Just a local dummy check component for standard usage
function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
