const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration(migrationFile) {
  try {
    console.log(`Running migration: ${migrationFile}...`);
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await db.query(statement);
      }
    }
    
    console.log(`Migration ${migrationFile} completed successfully!`);
    
  } catch (error) {
    console.error(`Migration ${migrationFile} failed:`, error);
    throw error;
  }
}

async function runSchemaUpdate() {
  try {
    console.log('Running complete schema update...');
    
    // Run migrations in order
    await runMigration('006_complete_schema_update.sql');
    await runMigration('007_add_indexes_and_constraints.sql');
    
    console.log('All schema updates completed successfully!');
    console.log('All tables, indexes, and constraints have been created/updated.');
    
  } catch (error) {
    console.error('Schema update failed:', error);
  } finally {
    process.exit();
  }
}

runSchemaUpdate(); 