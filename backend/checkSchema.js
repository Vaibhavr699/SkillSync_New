const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skillsync',
  password: 'postgres',
  port: 5432,
});

async function checkSchema() {
  try {
    console.log('Checking project_applications table schema...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'project_applications' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Current columns in project_applications table:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkSchema(); 