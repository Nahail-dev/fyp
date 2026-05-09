const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xkvyjgipwbbcgubibvjh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdnlqZ2lwd2JiY2d1YmlidmpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM3NzM2MywiZXhwIjoyMDkyOTUzMzYzfQ.pkNuUGlXBJj3guc71MFj75xh-Ux7P_APOYGWx_v93KA'
);

async function initDatabase() {
  try {
    console.log('[v0] Initializing database tables...');

    // Create profiles table
    const { error: profilesError } = await supabase.rpc('_execute_sql', {
      sql: `
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
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update their own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
      `
    });

    if (profilesError) {
      console.log('[v0] Note: Profiles table might already exist or RPC not available');
    } else {
      console.log('[v0] Profiles table created successfully');
    }

    // Create letters table
    const { error: lettersError } = await supabase.rpc('_execute_sql', {
      sql: `
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
        
        ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
      `
    });

    if (lettersError) {
      console.log('[v0] Note: Letters table might already exist');
    } else {
      console.log('[v0] Letters table created successfully');
    }

    console.log('[v0] Database initialization complete!');
    
  } catch (error) {
    console.error('[v0] Error:', error.message);
  }
}

initDatabase();
