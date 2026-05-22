import { Cloud } from 'lucide-react';

export default function CloudPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-white">
      <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Cloud className="h-12 w-12 text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">OneDrive</h2>
      <p className="text-gray-500 max-w-sm text-center">
        Shared files and cloud storage coming soon.
      </p>
    </div>
  );
}
