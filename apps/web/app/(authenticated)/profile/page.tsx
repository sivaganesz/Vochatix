'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Calendar, Mail, Info, Link as LinkIcon, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useProfile } from '@/hooks/useProfile';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { getProfile, updateProfile, isLoading: profileLoading, error } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    dob: '',
    socialLinks: [] as { platform: string; url: string }[],
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    const loadProfile = async () => {
      if (user?.id) {
        const data = await getProfile(user.id);
        if (data) {
          setFormData({
            name: data.name || '',
            bio: data.bio || '',
            dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
            socialLinks: data.socialLinks || [],
          });
        }
      }
    };

    if (isAuthenticated) {
      loadProfile();
    }
  }, [user?.id, isAuthenticated, authLoading, router, getProfile]);

  const handleSave = async () => {
    await updateProfile({
      name: formData.name,
      bio: formData.bio,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      socialLinks: formData.socialLinks,
    });
    setIsEditing(false);
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index][field] = value;
    setFormData({ ...formData, socialLinks: newLinks });
  };

  if (authLoading || (profileLoading && !isEditing)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  // Base styling for the glassmorphic tiles
  const tileClasses = `
    bg-white/60 backdrop-blur-xl border border-white/40 
    rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
    transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
    hover:-translate-y-1 relative overflow-hidden group
  `;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-300 via-fuchsia-200 to-indigo-300 animate-gradient-x mix-blend-multiply" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob [animation-delay:2s]" />
        <div className="absolute top-40 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob [animation-delay:4s]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center gap-2 p-2.5 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 hover:bg-white/90 transition-colors text-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium pr-2">Back to Chat</span>
          </button>
          
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={profileLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-medium shadow-sm transition-all active:scale-95 ${
              isEditing 
                ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md' 
                : 'bg-white/70 backdrop-blur-md border border-white/50 text-slate-700 hover:bg-white/90'
            }`}
          >
            {profileLoading ? (
              <Spinner size="sm" className="text-white" />
            ) : isEditing ? (
              <>
                <Save className="h-4 w-4" /> Save Profile
              </>
            ) : (
              'Edit Profile'
            )}
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 rounded-2xl text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Hero Tile (Avatar, Name, Email) - Spans 2 columns on desktop */}
          <div className={`${tileClasses} md:col-span-2 flex flex-col sm:flex-row items-center sm:items-start gap-6`}>
            {/* Soft decorative blob inside tile */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
            
            <div className="relative">
              <Avatar name={formData.name || 'User'} avatarUrl={user?.avatarUrl} size="2xl" />
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:scale-105 transition-transform">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg font-bold text-slate-900"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{formData.name || 'Anonymous User'}</h1>
                  <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 text-slate-500 bg-slate-100/50 w-fit px-3 py-1 rounded-lg">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Date of Birth Tile */}
          <div className={`${tileClasses} flex flex-col justify-center`}>
            <div className="flex items-center gap-2 mb-4 text-indigo-500">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-700">Date of Birth</h3>
            </div>
            
            {isEditing ? (
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
              />
            ) : (
              <p className="text-lg font-bold text-slate-900">
                {formData.dob
                  ? new Date(formData.dob).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : <span className="text-slate-400 font-medium">Not specified</span>}
              </p>
            )}
          </div>

          {/* Bio Tile - Spans full width */}
          <div className={`${tileClasses} md:col-span-3 min-h-[160px]`}>
            <div className="flex items-center gap-2 mb-4 text-fuchsia-500">
              <div className="p-2 bg-fuchsia-50 rounded-xl">
                <Info className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-700">About Me</h3>
            </div>
            
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none transition-all text-slate-700 resize-none"
                placeholder="Write a short bio about yourself..."
              />
            ) : (
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {formData.bio || <span className="text-slate-400 italic">No bio provided yet. Click edit to add one!</span>}
              </p>
            )}
          </div>

          {/* Social Links Tile - Spans full width */}
          <div className={`${tileClasses} md:col-span-3`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-blue-500">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-700">Social Connections</h3>
              </div>
              
              {isEditing && (
                <button
                  onClick={addSocialLink}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Link
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isEditing && formData.socialLinks.length === 0 && (
                <p className="text-slate-400 font-medium italic col-span-2">No social links added</p>
              )}

              {formData.socialLinks.map((link, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isEditing ? 'bg-slate-50/50 border border-slate-100' : 'bg-white/40 hover:bg-white/60 border border-white/50'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        placeholder="Platform"
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        className="w-1/3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <button
                        onClick={() => removeSocialLink(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full group/link"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase shadow-sm">
                        {link.platform.charAt(0) || <LinkIcon className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate capitalize">{link.platform}</p>
                        <p className="text-xs text-slate-500 truncate group-hover/link:text-blue-500 transition-colors">{link.url}</p>
                      </div>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
