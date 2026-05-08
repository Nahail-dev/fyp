-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create letters table
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  likes INT DEFAULT 0,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create stamps table
CREATE TABLE IF NOT EXISTS public.stamps (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stamp_name TEXT NOT NULL,
  emoji TEXT,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(user_id, stamp_name)
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  letters_received INT DEFAULT 0,
  letters_sent INT DEFAULT 0,
  stamps_collected INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are readable" ON public.profiles
  FOR SELECT USING (TRUE);

-- Create RLS policies for letters
CREATE POLICY "Users can view their own letters" ON public.letters
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert their own letters" ON public.letters
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own letters" ON public.letters
  FOR UPDATE USING (auth.uid() = sender_id);

-- Create RLS policies for stamps
CREATE POLICY "Users can view their own stamps" ON public.stamps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stamps" ON public.stamps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_stats
CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert test user profile for Ali Ahmad
-- Use this user ID: 320cd668-dd01-41db-b999-6dd498a3ed3d
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  bio,
  location,
  avatar_url,
  interests
) VALUES (
  '320cd668-dd01-41db-b999-6dd498a3ed3d',
  'Ali Ahmad',
  'arcityofficial@gmail.com',
  'Test user profile - Learning about mindful letter exchange',
  'Pakistan',
  NULL,
  ARRAY['Writing', 'Technology', 'Travel']
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  interests = EXCLUDED.interests;

-- Insert initial stats for Ali Ahmad
INSERT INTO public.user_stats (
  user_id,
  letters_received,
  letters_sent,
  stamps_collected,
  total_likes
) VALUES (
  '320cd668-dd01-41db-b999-6dd498a3ed3d',
  0,
  0,
  0,
  0
) ON CONFLICT (user_id) DO NOTHING;
