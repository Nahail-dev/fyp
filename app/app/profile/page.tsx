'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { User, Mail, MapPin, Pencil, X, Save, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    interests: '',
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data: UserProfile = await response.json();
        setProfile(data);
        setFormData({
          full_name: data.full_name,
          bio: data.bio || '',
          location: data.location || '',
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : '',
        });
      } catch (error) {
        console.log('[v0] Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const interestsArray = formData.interests
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          interests: interestsArray,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
      console.log('[v0] Profile saved:', updatedProfile);
    } catch (error) {
      console.log('[v0] Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
      toast.success('Signed out successfully');
    } catch (error) {
      console.log('[v0] Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <div className="postal-card p-6 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  {profile.full_name}
                </h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Member Since</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-sm border-2 border-destructive text-destructive hover:bg-destructive/10 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Column - Edit Form / Info */}
        <div className="lg:col-span-2">
          <div className="postal-card p-6 space-y-6">
            {isEditing ? (
              <>
                {/* Edit Form */}
                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Your location"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-4 py-3 rounded-sm border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      rows={4}
                      placeholder="Tell us about yourself"
                    />
                    <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
                  </div>

                  {/* Interests */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Interests</label>
                    <input
                      type="text"
                      value={formData.interests}
                      onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                      className="w-full px-4 py-3 rounded-sm border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Separate with commas (e.g., Photography, Travel, Writing)"
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple interests with commas</p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <p className="text-sm uppercase tracking-wide">Email</p>
                    </div>
                    <p className="text-lg font-medium text-foreground">{profile.email}</p>
                  </div>

                  {/* Location */}
                  {profile.location && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <p className="text-sm uppercase tracking-wide">Location</p>
                      </div>
                      <p className="text-lg font-medium text-foreground">{profile.location}</p>
                    </div>
                  )}

                  {/* Bio */}
                  {profile.bio && (
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-wide text-muted-foreground">About</p>
                      <p className="text-foreground leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm uppercase tracking-wide text-muted-foreground">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
