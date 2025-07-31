// Script to fix all projects with null company_id
const db = require('../config/db');

async function fixAllNullProjectCompanyIds() {
  let projectsFixed = 0;
  try {
    // Find all projects with null company_id
    const projects = await db.query(`
      SELECT p.id, p.created_by, u.company_id
      FROM projects p
      JOIN users u ON p.created_by = u.id
      WHERE p.company_id IS NULL AND u.company_id IS NOT NULL
    `);
    for (const project of projects.rows) {
      await db.query('UPDATE projects SET company_id = $1 WHERE id = $2', [project.company_id, project.id]);
      projectsFixed++;
      console.log(`Fixed project ${project.id}: set company_id = ${project.company_id}`);
    }
    if (projectsFixed === 0) {
      console.log('No projects needed fixing.');
    } else {
      console.log(`\n✅ Fixed ${projectsFixed} projects with null company_id.`);
    }
  } catch (err) {
    console.error('Error fixing projects:', err);
  } finally {
    db.end();
  }
}

fixAllNullProjectCompanyIds(); 