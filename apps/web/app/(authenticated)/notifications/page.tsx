import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-white">
      <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Bell className="h-12 w-12 text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Notifications</h2>
      <p className="text-gray-500 max-w-sm text-center">
        Activity and notifications coming soon.
      </p>
    </div>
  );
}
