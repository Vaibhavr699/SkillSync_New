// Auto-fix script for company_id mismatches
const db = require('../config/db');

async function fixCompanyIdMismatches() {
  let usersFixed = 0;
  let projectsFixed = 0;
  try {
    // 1. Fix company users without company_id
    const companyUsers = await db.query("SELECT id, name, email, company_id FROM users WHERE role = 'company'");
    for (const user of companyUsers.rows) {
      if (!user.company_id) {
        // Create company if not exists
        const companyName = `${user.name} (${user.email})`;
        let companyRes = await db.query('SELECT id FROM companies WHERE name = $1', [companyName]);
        let companyId;
        if (companyRes.rows.length === 0) {
          companyRes = await db.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [companyName]);
        }
        companyId = companyRes.rows[0].id;
        await db.query('UPDATE users SET company_id = $1 WHERE id = $2', [companyId, user.id]);
        usersFixed++;
        console.log(`Fixed user ${user.id}: set company_id = ${companyId}`);
      }
    }

    // 2. Fix projects with missing or mismatched company_id
    const projects = await db.query(`
      SELECT p.id, p.company_id, u.company_id AS creator_company_id
      FROM projects p
      JOIN users u ON p.created_by = u.id
      WHERE u.role = 'company'
    `);
    for (const project of projects.rows) {
      if (!project.company_id || project.company_id !== project.creator_company_id) {
        await db.query('UPDATE projects SET company_id = $1 WHERE id = $2', [project.creator_company_id, project.id]);
        projectsFixed++;
        console.log(`Fixed project ${project.id}: set company_id = ${project.creator_company_id}`);
      }
    }

    console.log(`\n✅ Auto-fix complete. Users fixed: ${usersFixed}, Projects fixed: ${projectsFixed}`);
  } catch (err) {
    console.error('Auto-fix error:', err);
  } finally {
    db.end();
  }
}

fixCompanyIdMismatches(); 