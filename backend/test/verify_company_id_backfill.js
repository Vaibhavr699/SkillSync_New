// Verification script for company_id backfill
const db = require('../config/db');

async function verifyCompanyIdBackfill() {
  try {
    // 1. Check all company users have a company_id
    const companyUsers = await db.query("SELECT id, name, email, company_id FROM users WHERE role = 'company'");
    const usersMissingCompanyId = companyUsers.rows.filter(u => !u.company_id);

    // 2. Check all projects created by company users have a matching company_id
    const projects = await db.query(`
      SELECT p.id, p.title, p.created_by, p.company_id, u.company_id AS creator_company_id
      FROM projects p
      JOIN users u ON p.created_by = u.id
      WHERE u.role = 'company'
    `);
    const projectsWithMismatch = projects.rows.filter(p => !p.company_id || p.company_id !== p.creator_company_id);

    // Print results
    console.log('--- Company Users Without company_id ---');
    if (usersMissingCompanyId.length === 0) {
      console.log('All company users have company_id.');
    } else {
      usersMissingCompanyId.forEach(u => console.log(`User ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`));
    }

    console.log('\n--- Projects With Missing or Mismatched company_id ---');
    if (projectsWithMismatch.length === 0) {
      console.log('All projects created by company users have correct company_id.');
    } else {
      projectsWithMismatch.forEach(p => console.log(`Project ID: ${p.id}, Title: ${p.title}, Creator: ${p.created_by}, Project company_id: ${p.company_id}, Creator company_id: ${p.creator_company_id}`));
    }

    // Summary
    if (usersMissingCompanyId.length === 0 && projectsWithMismatch.length === 0) {
      console.log('\n✅ Verification PASSED: All company users and projects are correctly linked.');
    } else {
      console.log('\n❌ Verification FAILED: See above for details.');
    }
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    db.end();
  }
}

verifyCompanyIdBackfill(); 