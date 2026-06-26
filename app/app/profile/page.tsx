'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient, resetBrowserClient } from '@/lib/supabaseClient';
import { User, Mail, Pencil, X, Save, LogOut, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AVATARS } from '@/lib/avatars';
import { AppScreenLoader } from '@/components/app-screen-loader';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string | null;
  interests: string[];
  theme: string;
  city_uuid_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CityOption {
  uuid_id: string;
  city: string;
  country: string;
  admin_name?: string | null;
}

async function getApiProfile(
  accessToken: string | undefined,
): Promise<
  | { profile: UserProfile }
  | { notFound: true }
  | { error: string }
> {
  const headers: HeadersInit = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const res = await fetch('/api/profile', {
    credentials: 'include',
    headers,
  });
  if (res.status === 404) {
    return { notFound: true };
  }
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    const msg =
      typeof j === 'object' &&
      j &&
      'error' in j &&
      typeof (j as { error: string }).error === 'string'
        ? (j as { error: string }).error
        : `HTTP ${res.status}`;
    return { error: msg };
  }
  return { profile: (await res.json()) as UserProfile };
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    interests: '',
  });
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('AUTH_REQUIRED');
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      let result = await getApiProfile(token);

      if ('error' in result) {
        throw new Error(result.error);
      }

      if ('notFound' in result) {
        if (!token) {
          throw new Error('Not authenticated');
        }
        const ensureRes = await fetch('/api/profile/ensure', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ensureRes.ok) {
          const errBody = await ensureRes.json().catch(() => ({}));
          throw new Error(
            typeof errBody === 'object' &&
              errBody &&
              'error' in errBody &&
              typeof (errBody as { error: string }).error === 'string'
              ? (errBody as { error: string }).error
              : 'Could not create your profile',
          );
        }
        result = await getApiProfile(token);
        if ('error' in result) {
          throw new Error(result.error);
        }
        if ('notFound' in result) {
          throw new Error(
            'Profile still missing after create. Check Supabase users table and ensure route logs.',
          );
        }
      }

      if (!('profile' in result)) {
        throw new Error('No profile row');
      }

      return result.profile;
    },
  });

  const profile = profileQuery.data ?? null;

  useEffect(() => {
    if (!profileQuery.error) return;
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : 'Failed to load profile';
    if (message === 'AUTH_REQUIRED') {
      router.push('/auth/login');
      return;
    }
    console.error('[profile] Loading failed:', message, profileQuery.error);
    toast.error(message);
  }, [profileQuery.error, router]);

  useEffect(() => {
    if (!profile || isEditing) return;
    setFormData({
      full_name: profile.full_name,
      bio: profile.bio || '',
      interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : '',
    });
    setSelectedAvatarUrl(profile.avatar_url);
  }, [isEditing, profile]);
  useEffect(() => {
    if (!profile?.city_uuid_id) {
      setSelectedCity(null);
      return;
    }

    let isMounted = true;
    fetch(`/api/cities?id=${encodeURIComponent(profile.city_uuid_id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setSelectedCity(data.city || null);
        }
      })
      .catch((error) => console.log('[profile] City lookup failed:', error));

    return () => {
      isMounted = false;
    };
  }, [profile?.city_uuid_id]);

  useEffect(() => {
    if (selectedCity || citySearch.trim().length < 2) {
      setCityResults([]);
      setIsSearchingCities(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearchingCities(true);
      try {
        const response = await fetch(
          `/api/cities?search=${encodeURIComponent(citySearch.trim())}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        setCityResults(response.ok ? data.cities || [] : []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.log('[profile] City search failed:', error);
        }
        setCityResults([]);
      } finally {
        setIsSearchingCities(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [citySearch, selectedCity]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const interestsArray = formData.interests
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          full_name: formData.full_name,
          bio: formData.bio,
          interests: interestsArray,
          city_uuid_id: selectedCity?.uuid_id ?? null,
          avatar_url: selectedAvatarUrl,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg =
          typeof j === 'object' &&
          j &&
          'error' in j &&
          typeof (j as { error: string }).error === 'string'
            ? (j as { error: string }).error
            : `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const updatedProfile = (await res.json()) as UserProfile;
      queryClient.setQueryData(['profile'], updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('[profile] Save failed:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Signed out successfully');
      resetBrowserClient();
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/auth/login');
    } catch (error) {
      console.error('[profile] Sign out failed:', error);
      toast.error('Failed to sign out');
    }
  };

  if (profileQuery.isLoading) {
    return (
      <AppScreenLoader title="Profile" message="Loading your profile..." />
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
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

                  {/* Username (Read-only) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-4 py-3 rounded-sm border border-border bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Username is set on signup</p>
                  </div>

                  {/* Avatar */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Profile Avatar
                    </label>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {AVATARS.map((avatar) => {
                        const isSelected = selectedAvatarUrl === avatar.image;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => setSelectedAvatarUrl(avatar.image)}
                            className={`rounded-full border-2 p-1 transition hover:scale-105 ${
                              isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            title={avatar.name}
                          >
                            <img
                              src={avatar.image}
                              alt={avatar.name}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-3 rounded-sm border border-border bg-muted/30 p-3">
                      {selectedAvatarUrl ? (
                        <img
                          src={selectedAvatarUrl}
                          alt="Selected avatar"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {selectedAvatarUrl ? 'Selected avatar' : 'No avatar selected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Choose one of the Yuubin avatars for your profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      City for Letter Delivery
                    </label>
                    {selectedCity ? (
                      <div className="flex items-center justify-between gap-3 rounded-sm border border-primary/40 bg-primary/10 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-serif font-bold text-foreground">
                            {selectedCity.city}, {selectedCity.country}
                          </p>
                          {selectedCity.admin_name && (
                            <p className="truncate text-xs text-muted-foreground">
                              {selectedCity.admin_name}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCity(null);
                            setCitySearch('');
                          }}
                          className="rounded-sm p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          aria-label="Remove selected city"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder="Search city, e.g. Lahore"
                          className="w-full px-4 py-3 rounded-sm border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        {(cityResults.length > 0 || isSearchingCities) && (
                          <div className="max-h-60 overflow-y-auto rounded-sm border border-border bg-card shadow-xl">
                            {isSearchingCities ? (
                              <div className="px-4 py-3 text-sm text-muted-foreground">
                                Searching cities...
                              </div>
                            ) : (
                              cityResults.map((city) => (
                                <button
                                  key={city.uuid_id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCity(city);
                                    setCitySearch(`${city.city}, ${city.country}`);
                                    setCityResults([]);
                                  }}
                                  className="w-full px-4 py-3 text-left transition hover:bg-muted"
                                >
                                  <p className="font-serif font-bold text-foreground">
                                    {city.city}, {city.country}
                                  </p>
                                  {city.admin_name && (
                                    <p className="text-xs text-muted-foreground">
                                      {city.admin_name}
                                    </p>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                    <p className="text-xs text-muted-foreground">
                      This is used to estimate delayed letter delivery.
                    </p>
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

                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Username</p>
                    <p className="text-lg font-medium text-foreground">@{profile.username}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <p className="text-sm uppercase tracking-wide">Letter City</p>
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      {selectedCity
                        ? `${selectedCity.city}, ${selectedCity.country}`
                        : 'Not set'}
                    </p>
                  </div>

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
