-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  theme VARCHAR(50) DEFAULT 'modern',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Passwords table (for auth)
CREATE TABLE IF NOT EXISTS passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Letters table
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  delivery_date TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN DEFAULT true,
  stamp_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Stamps table (for collectibles)
CREATE TABLE IF NOT EXISTS stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  svg_icon TEXT,
  color_code VARCHAR(10),
  rarity VARCHAR(50) DEFAULT 'common',
  unlock_requirement VARCHAR(255),
  theme VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stamps (collected stamps)
CREATE TABLE IF NOT EXISTS user_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stamp_id UUID NOT NULL REFERENCES stamps(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stamp_id)
);

-- Delivery tracking
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL UNIQUE REFERENCES letters(id) ON DELETE CASCADE,
  current_status VARCHAR(50) DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  location VARCHAR(255),
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages/Comments on letters
CREATE TABLE IF NOT EXISTS letter_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes/Reactions on letters
CREATE TABLE IF NOT EXISTS letter_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(letter_id, user_id, reaction_type)
);

-- User connections/follows
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  related_letter_id UUID REFERENCES letters(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_letters_sender_id ON letters(sender_id);
CREATE INDEX IF NOT EXISTS idx_letters_recipient_id ON letters(recipient_id);
CREATE INDEX IF NOT EXISTS idx_letters_status ON letters(status);
CREATE INDEX IF NOT EXISTS idx_user_stamps_user_id ON user_stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_letter_id ON delivery_tracking(letter_id);
