# Yuubin Setup Guide

## Environment Variables ✅
- Already configured in `.env.local`
- Supabase URL and API keys are set up

## Database Setup Required

### Step 1: Create Tables in Supabase

The test user **Ali Ahmad** has already been created in Supabase authentication, but the `profiles` table doesn't exist yet. You need to create the database tables.

**Option A: Using Supabase SQL Editor (Recommended)**

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project `fyp`
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire content from `DATABASE_SETUP.sql` file in this project
6. Click **Run** button
7. Wait for all queries to complete successfully

**Option B: Manual Table Creation**

If you prefer to create tables manually, execute these SQL commands one by one in the SQL Editor:

```sql
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are readable" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Step 2: Verify Tables Were Created

After running the SQL:
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `profiles`
   - `letters`
   - `stamps`
   - `user_stats`

## Test User Credentials

After setting up the database, you can log in with:

- **Email:** arcityofficial@gmail.com
- **Password:** ahmad1122
- **Name:** Ali Ahmad
- **Location:** Pakistan

## Verify Everything Works

1. Go to http://localhost:3000/auth/login
2. Sign in with the test user credentials above
3. You should see:
   - User name "Ali Ahmad" in the sidebar
   - Dashboard with stats
   - Profile page with editable information
   - All database operations working

## Error Diagnostics

**Error: "Could not find the table 'public.profiles'"**
- Solution: Run the `DATABASE_SETUP.sql` file in your Supabase SQL Editor

**Error: "Your project's URL and API key are required"**
- Solution: Ensure `.env.local` file exists with correct credentials (already done)
- If still failing, restart the dev server: `npm run dev`

**Google OAuth Not Working**
- You need to configure Google OAuth in your Supabase project
- Go to **Authentication > Providers > Google**
- Add your Google OAuth credentials there

## Google OAuth Setup (Optional)

To enable Google sign-in:

1. Get Google OAuth credentials from Google Cloud Console
2. In Supabase Dashboard, go to **Authentication > Providers**
3. Find "Google" and click Enable
4. Add your Google Client ID and Client Secret
5. Add this redirect URI: `https://xkvyjgipwbbcgubibvjh.supabase.co/auth/v1/callback`

Then users can sign up/login with Google and their profile will be auto-populated.

---

**Status:** ✅ Environment Variables Ready | ⏳ Database Tables Needed | ✅ Authentication Ready
