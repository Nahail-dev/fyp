# Yuubin Database Setup Guide

## Overview
This guide explains how to set up the Supabase database for the Yuubin application.

## Prerequisites
- Supabase account (create at https://supabase.com)
- A Supabase project created

## Environment Variables

Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Find these values in your Supabase project settings:
- Go to Settings → API
- Copy the Project URL and keys from there

## Database Setup

### Step 1: Create Tables

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `scripts/01-create-tables.sql`
5. Click "Run"

This will create all the necessary tables for Yuubin:

- **users** - User accounts and profiles
- **passwords** - Hashed passwords (for custom auth)
- **letters** - Letters and correspondence
- **stamps** - Collectible stamps
- **user_stamps** - User's collected stamps
- **delivery_tracking** - Letter delivery status tracking
- **letter_comments** - Comments on letters
- **letter_reactions** - Likes/reactions on letters
- **user_follows** - User follows/connections
- **notifications** - User notifications

### Step 2: Enable Row Level Security (Optional but Recommended)

For production, enable RLS on sensitive tables:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Create policies (example for letters)
CREATE POLICY "Users can view their own letters"
  ON letters FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert their own letters"
  ON letters FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
```

### Step 3: Seed Sample Data (Optional)

Add sample stamps and users for testing:

```sql
-- Add sample stamps
INSERT INTO stamps (name, description, rarity, color_code) VALUES
  ('Golden Letter', 'For your first letter', 'rare', '#D4AF6A'),
  ('Love Bearer', 'Send a letter with love', 'uncommon', '#E8B4B8'),
  ('Green Journey', 'For letters from nature', 'uncommon', '#A8B89A'),
  ('Midnight Express', 'For night-time writers', 'rare', '#4A4033'),
  ('Vintage Soul', 'Collector of old letters', 'legendary', '#8B6F47');
```

## API Routes Documentation

### Authentication

**POST /api/auth/signup**
- Create new user account
- Body: `{ email, username, fullName, password }`
- Returns: User object with ID

**POST /api/auth/login**
- Authenticate user
- Body: `{ email, password }`
- Returns: User object with theme and preferences

### Letters

**GET /api/letters**
- Fetch user's letters
- Query params: `userId`, `type` (inbox|sent|drafts)
- Returns: Array of letters

**POST /api/letters**
- Create new letter
- Body: `{ senderId, recipientId, title, content, status }`
- Returns: Created letter object

**GET /api/letters/[id]**
- Fetch single letter with details
- Returns: Letter with sender, recipient, comments

**PATCH /api/letters/[id]**
- Update letter (draft, send, etc)
- Body: `{ title, content, status, recipientId }`
- Returns: Updated letter

**DELETE /api/letters/[id]**
- Delete letter (only drafts)
- Returns: Success message

### Users

**GET /api/users/[id]**
- Fetch user profile
- Returns: User profile with stamps, followers

**PATCH /api/users/[id]**
- Update user profile
- Body: `{ fullName, bio, interests, avatarUrl, theme }`
- Returns: Updated user object

### Stamps

**GET /api/stamps**
- Fetch all stamps or user's collected stamps
- Query params: `userId`, `type` (all|collected)
- Returns: Array of stamps

**POST /api/stamps**
- Unlock stamp for user
- Body: `{ userId, stampId }`
- Returns: User stamp record

### Delivery Tracking

**GET /api/delivery**
- Get letter delivery status
- Query params: `letterId`
- Returns: Delivery tracking object

**POST /api/delivery**
- Create tracking for letter
- Body: `{ letterId, status }`
- Returns: Tracking object

**PATCH /api/delivery**
- Update delivery status
- Body: `{ letterId, status, progress, location }`
- Returns: Updated tracking

## Database Schema Details

### Users Table
- `id`: UUID (primary key)
- `email`: Unique email
- `username`: Unique username
- `full_name`: Display name
- `avatar_url`: Profile picture URL
- `bio`: User biography
- `interests`: Array of interests
- `theme`: User's selected theme (modern/night/vintage)
- `created_at`, `updated_at`: Timestamps

### Letters Table
- `id`: UUID (primary key)
- `sender_id`: References users.id
- `recipient_id`: References users.id (nullable)
- `title`: Letter title
- `content`: Letter body text
- `status`: draft, sent, in_transit, delivered
- `delivery_date`: Scheduled delivery date
- `estimated_delivery`: Calculated delivery estimate
- `sent_at`, `delivered_at`: Timestamps

### Delivery Tracking Table
- `id`: UUID (primary key)
- `letter_id`: References letters.id
- `current_status`: Current delivery status
- `progress_percentage`: 0-100
- `location`: Current location
- `estimated_delivery`: When it will arrive
- `last_update`: Last status update time

## Testing the API

Use curl or Postman to test:

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","fullName":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create letter
curl -X POST http://localhost:3000/api/letters \
  -H "Content-Type: application/json" \
  -d '{"senderId":"user-id","title":"Hello","content":"Test letter","status":"draft"}'
```

## Troubleshooting

**"Missing SUPABASE_SERVICE_ROLE_KEY"**
- Make sure you've added the environment variables to `.env.local`
- Restart your dev server after adding env vars

**"User already exists"**
- Email is already registered. Use a different email.

**"Letter not found"**
- Make sure the letter ID exists and user has permission to view it

**Connection refused**
- Check your NEXT_PUBLIC_SUPABASE_URL is correct
- Make sure Supabase project is active

## Next Steps

1. Install dependencies: `pnpm install`
2. Add environment variables to `.env.local`
3. Set up database tables using the SQL file
4. Run dev server: `pnpm dev`
5. Test API routes
6. Connect frontend pages to API routes

## Support

For Supabase issues: https://supabase.com/docs
For Yuubin issues: Check the application code and API routes
