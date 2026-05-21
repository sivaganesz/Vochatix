import { useEffect, useState } from 'react';
import { X, Calendar, Link as LinkIcon, Mail, Info } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useProfile } from '@/hooks/useProfile';
import { User } from '@/types/chat.types';

interface UserProfilePanelProps {
  userId: string;
  onClose: () => void;
}

export function UserProfilePanel({ userId, onClose }: UserProfilePanelProps) {
  const { getProfile, isLoading, error } = useProfile();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getProfile(userId);
      if (data) {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [userId, getProfile]);

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold text-gray-900">Profile</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          title="Close profile"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner />
        </div>
      ) : error || !profile ? (
        <div className="flex-1 flex justify-center items-center text-red-500 p-4 text-center">
          {error || 'Profile not found'}
        </div>
      ) : (
        <div className="flex flex-col items-center p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center space-y-3">
            <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size="xl" isOnline={profile.isOnline} />
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500">{profile.isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* Details */}
          <div className="w-full space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-sm text-gray-900 mt-1">{profile.email}</p>
              </div>
            </div>

            {/* Date of Birth */}
            {profile.dob && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(profile.dob).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">About</p>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              </div>
            )}

            {/* Social Links */}
            {profile.socialLinks && profile.socialLinks.length > 0 && (
              <div className="flex items-start gap-3">
                <LinkIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="w-full">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Social Links</p>
                  <div className="space-y-2">
                    {profile.socialLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                      >
                        {link.platform}: {link.url}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
