const db = require('./config/db');

async function testCompanyApplications() {
  try {
    console.log('Testing database connection...');
    
    // Test if tables exist
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'projects', 'project_applications', 'user_profiles')
    `);
    
    console.log('Available tables:', tables.rows.map(t => t.table_name));
    
    // Check the structure of project_applications table
    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'project_applications' 
      ORDER BY ordinal_position
    `);
    
    console.log('Project applications table columns:');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    
    // Test if there are any projects
    const projects = await db.query('SELECT id, title, created_by FROM projects LIMIT 5');
    console.log('Projects found:', projects.rows.length);
    console.log('Sample projects:', projects.rows);
    
    // Test if there are any applications
    const applications = await db.query('SELECT id, project_id, freelancer_id, status FROM project_applications LIMIT 5');
    console.log('Applications found:', applications.rows.length);
    console.log('Sample applications:', applications.rows);
    
    // Test the full query with only existing columns
    if (projects.rows.length > 0) {
      const userId = projects.rows[0].created_by;
      console.log('Testing query for user:', userId);
      
      const companyApplications = await db.query(
        `SELECT 
          a.id,
          a.project_id,
          a.freelancer_id,
          COALESCE(a.cover_letter, a.proposal) as proposal,
          a.cover_letter,
          a.proposal as original_proposal,
          a.status,
          a.feedback,
          a.applied_at,
          p.title as project_title,
          u.email as freelancer_email,
          COALESCE(up.name, u.email) as freelancer_name,
          up.photo as freelancer_photo,
          up.hourly_rate,
          up.skills
         FROM project_applications a
         JOIN projects p ON a.project_id = p.id
         JOIN users u ON u.id = a.freelancer_id
         LEFT JOIN user_profiles up ON up.user_id = u.id
         WHERE p.created_by = $1
         ORDER BY a.applied_at DESC`,
        [userId]
      );
      
      console.log('Company applications found:', companyApplications.rows.length);
      console.log('Sample company application:', companyApplications.rows[0]);
    }
    
  } catch (error) {
    console.error('Error testing company applications:', error);
  } finally {
    process.exit(0);
  }
}

testCompanyApplications(); 