# Google OAuth & Profile Management Implementation

## Overview
Complete Google OAuth integration with profile management, avatar display, and database persistence across the Yuubin application.

## Features Implemented

### 1. Google OAuth Authentication
- **Location**: `/app/auth/login/page.tsx` and `/app/auth/signup/page.tsx`
- **Features**:
  - Google sign-in button with proper OAuth flow
  - Redirect to callback handler for session management
  - Auto-profile creation on first Google signup using Google metadata (name, email, avatar)
  - Session persistence across app

### 2. Auth Callback Handler
- **Location**: `/app/auth/callback/page.tsx`
- **Features**:
  - Processes OAuth callback from Supabase
  - Automatically creates user profile if not exists
  - Extracts Google user metadata (full_name, avatar_url) and stores in profiles table
  - Seamless redirect to dashboard after authentication

### 3. Profile Management
- **Location**: `/app/app/profile/page.tsx`
- **API Route**: `/app/api/profile/route.ts`
- **Features**:
  - Display user avatar prominently (from Google or profile picture)
  - Edit profile information: full name, location, bio, interests
  - Readonly email field (cannot be changed)
  - Member since date display
  - Sign out functionality with session cleanup
  - Real-time form validation and error handling

### 4. User Avatar Display
- **Location**: `/app/app/layout.tsx` (Sidebar)
- **Features**:
  - Avatar shown in sidebar navigation with name and email
  - Fallback to User icon if no avatar
  - Hover effects and responsive design
  - Integrated as clickable link to profile page

### 5. Database Integration

#### Profile Data Flow
1. **Google Sign-in** → OAuth callback captures user metadata
2. **Profile Creation** → Auto-creates record in `profiles` table
3. **Profile Display** → Fetches from database on app load
4. **Profile Update** → PUT request saves changes to database
5. **Avatar Display** → Pulls `avatar_url` from profiles table

#### Database Tables Used
- `profiles`: Stores user information (full_name, email, bio, location, avatar_url, interests, timestamps)
- `letters`: Fetches sender/recipient data for dashboard and lists
- `stamps`: Retrieves user's stamp collection

### 6. Database Testing Page
- **Location**: `/app/app/test-database/page.tsx`
- **Features**:
  - Comprehensive test suite for all database operations
  - Tests user authentication, profile fetch/update, letters, stamps, stats
  - Real-time test result display with success/error feedback
  - Browser console logging for debugging
  - Helps verify all tables are working correctly

## File Structure

```
app/
├── auth/
│   ├── login/page.tsx          (Google OAuth button + flow)
│   ├── signup/page.tsx         (Google OAuth + auto-populate)
│   └── callback/page.tsx       (OAuth callback handler, profile creation)
├── api/
│   └── profile/route.ts        (GET/PUT profile API)
├── app/
│   ├── layout.tsx              (Avatar display in sidebar)
│   ├── profile/page.tsx        (Profile edit/view page)
│   └── test-database/page.tsx  (Database testing suite)
└── lib/
    └── supabaseClient.ts       (Supabase client)
```

## API Endpoints

### GET /api/profile
- **Auth**: Required (user must be logged in)
- **Returns**: User profile object with all fields
- **Error**: 401 if unauthorized, 500 if fetch fails

### PUT /api/profile
- **Auth**: Required
- **Body**: `{ full_name, bio, location, interests }`
- **Returns**: Updated profile object
- **Error**: 401 if unauthorized, 500 if update fails

## Data Persistence Flow

### Sign-up with Google
1. User clicks "Google" button
2. OAuth redirects to Google
3. User approves app permissions
4. Supabase callback handler creates session
5. App redirects to `/auth/callback`
6. Callback checks if profile exists
7. If not, creates profile from Google metadata:
   - `id`: Supabase user ID
   - `full_name`: from Google account
   - `email`: from Google account
   - `avatar_url`: from Google account
   - Other fields: empty defaults

### Profile Update
1. User visits profile page
2. App fetches current profile from DB
3. User clicks "Edit Profile"
4. User modifies form fields
5. User clicks "Save Changes"
6. PUT request sends updated data
7. Database persists changes
8. Profile page refreshes with new data

### Avatar Display
1. On app load, layout.tsx fetches user profile
2. Extracts `avatar_url` from profiles table
3. Displays in sidebar with hover effects
4. If no URL, shows default User icon

## Testing Database Integration

1. Navigate to `/app/test-database`
2. Click "Run Database Tests"
3. Tests will verify:
   - User authentication
   - Profile fetch and update
   - Letters received/sent counts
   - Stamp collection
   - User statistics calculation
   - All user profiles (for explore page)
4. Check browser console (F12) for detailed logs

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Supabase Google OAuth Setup

To enable Google OAuth:
1. Go to Supabase Dashboard → Authentication → Providers
2. Find Google provider and click "Enable"
3. Add your Google OAuth credentials (Client ID and Secret)
4. Configure redirect URIs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback`

## Security Features

- Session stored in Supabase auth (secure)
- Email validation on signup
- Password hashing (email/password auth)
- RLS policies on database tables
- No sensitive data in client storage
- API routes with user authorization checks
- Profile updates restricted to authenticated users

## Next Steps

1. Test Google OAuth flow by signing in
2. Visit profile page to verify avatar display
3. Edit profile and verify database persistence
4. Run database tests to validate all operations
5. Check console logs for any errors

## Console Debugging

All operations log with `[v0]` prefix in browser console:
- `[v0] User profile loaded: {...}`
- `[v0] Profile saved: {...}`
- `[v0] Error fetching profile: {...}`

Open browser DevTools (F12) and filter for `[v0]` to see all app logs.
