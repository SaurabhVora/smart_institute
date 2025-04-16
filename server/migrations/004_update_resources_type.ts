import { sql } from "drizzle-orm";
import { db } from "../db";

// Migration to update resources table type enum to include 'file'
export async function up(client: any) {
  console.log("Running migration: update resources type enum to include 'file'");
  
  try {
    // Drop the existing constraint
    await client.query(`
      ALTER TABLE resources 
      DROP CONSTRAINT IF EXISTS resources_type_check
    `);
    
    // Add the new constraint with updated enum values
    await client.query(`
      ALTER TABLE resources 
      ADD CONSTRAINT resources_type_check 
      CHECK (type IN ('guideline', 'link', 'file'))
    `);
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
} 