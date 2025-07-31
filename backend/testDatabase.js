const db = require('./config/db');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await db.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    
    // Check if user_profiles table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
      );
    `);
    console.log('user_profiles table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Check table structure
      const columns = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles'
        ORDER BY ordinal_position;
      `);
      console.log('user_profiles columns:', columns.rows);
      
      // Check if there are any records
      const count = await db.query('SELECT COUNT(*) as count FROM user_profiles');
      console.log('user_profiles record count:', count.rows[0].count);
      
      // Test skills query
      try {
        const skills = await db.query(`
          SELECT DISTINCT unnest(skills) as skill 
          FROM user_profiles 
          WHERE skills IS NOT NULL 
          AND array_length(skills, 1) > 0
        `);
        console.log('Skills found:', skills.rows);
      } catch (error) {
        console.error('Skills query error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 