/**
 * Migration: Add internships table
 */
export async function up(client) {
  // Create internships table
  await client.query(`
    CREATE TABLE IF NOT EXISTS internships (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      duration TEXT NOT NULL,
      stipend TEXT NOT NULL,
      deadline TEXT NOT NULL,
      skills TEXT[] NOT NULL,
      description TEXT NOT NULL,
      logo TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER NOT NULL REFERENCES users(id)
    );
  `);

  // Add check constraint for type
  await client.query(`
    ALTER TABLE internships
    ADD CONSTRAINT internships_type_check
    CHECK (type IN ('Full-time', 'Part-time'))
  `);

  // Add check constraint for category
  await client.query(`
    ALTER TABLE internships
    ADD CONSTRAINT internships_category_check
    CHECK (category IN (
      'Web Development', 'Mobile Development', 'Data Science', 
      'Machine Learning', 'Cloud Computing', 'Cybersecurity', 
      'UI/UX Design', 'DevOps', 'Blockchain', 'Other'
    ))
  `);
}

/**
 * Down Migration: Remove internships table
 */
export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS internships`);
} 