/**
 * Migration: Fix internship deadline field type
 */
export async function up(client) {
  // Drop any existing date/time constraints on the deadline column
  await client.query(`
    ALTER TABLE internships 
    ALTER COLUMN deadline TYPE TEXT;
  `);
}

/**
 * Down Migration: Revert changes
 */
export async function down(client) {
  // No need to revert as we want to keep deadline as TEXT
  return;
} 