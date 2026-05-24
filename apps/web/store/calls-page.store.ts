import { create } from 'zustand';

interface CallsPageState {
  selectedCallId: string | null;
  setSelectedCallId: (id: string | null) => void;
  filter: 'All' | 'Missed' | 'Incoming' | 'Outgoing' | 'Group';
  setFilter: (filter: 'All' | 'Missed' | 'Incoming' | 'Outgoing' | 'Group') => void;
}

export const useCallsPageStore = create<CallsPageState>((set) => ({
  selectedCallId: null,
  setSelectedCallId: (id) => set({ selectedCallId: id }),
  filter: 'All',
  setFilter: (filter) => set({ filter }),
}));
