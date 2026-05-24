'use client';

import { CallsSidebar } from '@/components/calls/CallsSidebar';
import { CallHistoryPanel } from '@/components/calls/CallHistoryPanel';
import { CallDetailsPanel } from '@/components/calls/CallDetailsPanel';

export default function CallsPage() {
  return (
    <div className="flex h-full w-full bg-white text-gray-900 overflow-hidden">
      {/* 30% left panel */}
      <div className="w-[30%] min-w-[300px] border-r border-gray-200 h-full flex flex-col">
        <CallsSidebar />
      </div>
      
      {/* 45% middle panel */}
      <div className="w-[45%] min-w-[400px] border-r border-gray-200 h-full flex flex-col bg-gray-50/30">
        <CallHistoryPanel />
      </div>
      
      {/* 25% right panel */}
      <div className="flex-1 min-w-[300px] h-full flex flex-col bg-gray-50/50">
        <CallDetailsPanel />
      </div>
    </div>
  );
}
