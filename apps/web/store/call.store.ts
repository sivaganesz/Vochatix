import { create } from 'zustand';
import { Call, IncomingCallState } from '@/types/call.types';

interface CallStore {
  activeCall: Call | null;
  incomingCall: IncomingCallState | null;
  liveKitToken: string | null;
  liveKitUrl: string | null;

  setActiveCall: (call: Call | null) => void;
  setIncomingCall: (state: IncomingCallState | null) => void;
  setLiveKitToken: (token: string | null) => void;
  setLiveKitUrl: (url: string | null) => void;
  clearCall: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
  activeCall: null,
  incomingCall: null,
  liveKitToken: null,
  liveKitUrl: null,

  setActiveCall: (call) => set({ activeCall: call }),

  setIncomingCall: (state) => set({ incomingCall: state }),

  setLiveKitToken: (token) => set({ liveKitToken: token }),

  setLiveKitUrl: (url) => set({ liveKitUrl: url }),

  clearCall: () =>
    set({
      activeCall: null,
      liveKitToken: null,
      liveKitUrl: null,
    }),
}));
