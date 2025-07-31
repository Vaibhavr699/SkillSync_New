const db = require('./config/db');

async function testProfileUpload() {
  try {
    console.log('Testing profile upload functionality...');
    
    // Check if user_profiles table exists and has the photo column
    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name = 'photo'
    `);
    
    console.log('Photo column exists:', columns.rows.length > 0);
    
    // Check if there are any users with profiles
    const users = await db.query(`
      SELECT u.id, u.email, u.role, up.name, up.photo
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LIMIT 5
    `);
    
    console.log('Users with profiles found:', users.rows.length);
    console.log('Sample users:', users.rows.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      hasPhoto: !!u.photo
    })));
    
    // Test the profile photo upload endpoint structure
    console.log('\nProfile photo upload endpoint should be:');
    console.log('POST /api/users/profile-photo');
    console.log('Headers: Authorization: Bearer <token>');
    console.log('Body: multipart/form-data with field "photo"');
    
  } catch (error) {
    console.error('Error testing profile upload:', error);
  } finally {
    process.exit(0);
  }
}

testProfileUpload(); 