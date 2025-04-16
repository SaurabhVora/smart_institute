import { pool } from './db';

// Migration to add missing columns to users table
async function migrateUsersTable() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // Check if email_verified column exists
    const checkEmailVerifiedResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email_verified'
    `);
    
    // Add email_verified column if it doesn't exist
    if (checkEmailVerifiedResult.rows.length === 0) {
      console.log('Adding email_verified column to users table');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN email_verified BOOLEAN DEFAULT FALSE
      `);
    }
    
    // Check if company_name column exists
    const checkCompanyNameResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'company_name'
    `);
    
    // Add company_name column if it doesn't exist
    if (checkCompanyNameResult.rows.length === 0) {
      console.log('Adding company_name column to users table');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN company_name TEXT
      `);
    }
    
    // Check if industry column exists
    const checkIndustryResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'industry'
    `);
    
    // Add industry column if it doesn't exist
    if (checkIndustryResult.rows.length === 0) {
      console.log('Adding industry column to users table');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN industry TEXT
      `);
    }
    
    // Check if position column exists
    const checkPositionResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'position'
    `);
    
    // Add position column if it doesn't exist
    if (checkPositionResult.rows.length === 0) {
      console.log('Adding position column to users table');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN position TEXT
      `);
    }
    
    // Check if expertise column exists
    const checkExpertiseResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'expertise'
    `);
    
    // Add expertise column if it doesn't exist
    if (checkExpertiseResult.rows.length === 0) {
      console.log('Adding expertise column to users table');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN expertise TEXT
      `);
    }
    
    // Check if profile_completed column exists
    const checkProfileCompletedResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_completed'
    `);
    
    // Add profile_completed column if it doesn't exist
    if (checkProfileCompletedResult.rows.length === 0) {
      console.log('Adding profile_completed column to users table');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE
      `);
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

// Run the migration
migrateUsersTable().catch(console.error);

export { migrateUsersTable }; 