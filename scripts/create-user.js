const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xkvyjgipwbbcgubibvjh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdnlqZ2lwd2JiY2d1YmlidmpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM3NzM2MywiZXhwIjoyMDkyOTUzMzYzfQ.pkNuUGlXBJj3guc71MFj75xh-Ux7P_APOYGWx_v93KA'
);

async function createUser() {
  try {
    console.log('[v0] Creating user Ali Ahmad...');
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'arcityofficial@gmail.com',
      password: 'ahmad1122',
      email_confirm: true,
    });

    if (authError) {
      console.error('[v0] Error creating auth user:', authError);
      return;
    }

    console.log('[v0] Auth user created:', authData.user.id);

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        full_name: 'Ali Ahmad',
        email: 'arcityofficial@gmail.com',
        bio: 'Test user profile',
        location: 'Pakistan',
        interests: ['Writing', 'Technology', 'Travel'],
        avatar_url: null,
      })
      .select();

    if (profileError) {
      console.error('[v0] Error creating profile:', profileError);
      return;
    }

    console.log('[v0] Profile created successfully:', profileData);
    console.log('\n✅ User created successfully!');
    console.log('Email: arcityofficial@gmail.com');
    console.log('Password: ahmad1122');
    console.log('Name: Ali Ahmad');
    
  } catch (error) {
    console.error('[v0] Error:', error);
  }
}

createUser();
