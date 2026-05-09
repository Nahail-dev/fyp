const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xkvyjgipwbbcgubibvjh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdnlqZ2lwd2JiY2d1YmlidmpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM3NzM2MywiZXhwIjoyMDkyOTUzMzYzfQ.pkNuUGlXBJj3guc71MFj75xh-Ux7P_APOYGWx_v93KA'
);

async function checkSchema() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.log('[v0] Error:', error);
      return;
    }

    console.log('[v0] Available tables:');
    data.forEach(table => console.log('  -', table.table_name));
  } catch (error) {
    console.error('[v0] Error:', error);
  }
}

checkSchema();
