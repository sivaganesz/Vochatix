import { MessageSquare } from 'lucide-react';

export function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <MessageSquare className="h-12 w-12 text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Vochatix</h2>
      <p className="text-gray-500 max-w-sm">
        Select a conversation from the sidebar or start a new one by clicking the + button.
      </p>
    </div>
  );
}
