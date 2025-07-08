const db = require('./config/db');

async function testFileUpload() {
  try {
    console.log('Testing file upload functionality...');
    
    // Check if files table exists
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'files'
    `);
    
    console.log('Files table exists:', tables.rows.length > 0);
    
    if (tables.rows.length > 0) {
      // Check files table structure
      const columns = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'files' 
        ORDER BY ordinal_position
      `);
      
      console.log('Files table columns:');
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
      
      // Check if there are any existing files
      const files = await db.query('SELECT id, filename, uploaded_by FROM files LIMIT 5');
      console.log('Existing files:', files.rows.length);
    }
    
    // Check if project_files table exists
    const projectFilesTable = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'project_files'
    `);
    
    console.log('Project files table exists:', projectFilesTable.rows.length > 0);
    
    // Test the file upload endpoint structure
    console.log('\nFile upload endpoint should be:');
    console.log('POST /api/files/upload');
    console.log('Headers: Authorization: Bearer <token>');
    console.log('Body: multipart/form-data with field "files"');
    
  } catch (error) {
    console.error('Error testing file upload:', error);
  } finally {
    process.exit(0);
  }
}

testFileUpload(); 