import { db } from "../db";
import { sql } from "drizzle-orm";

export async function up() {
  console.log("Creating internship_applications table...");
  
  // Create the internship_applications table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "internship_applications" (
      "id" serial PRIMARY KEY NOT NULL,
      "internship_id" integer NOT NULL REFERENCES "internships"("id") ON DELETE CASCADE,
      "student_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "status" text NOT NULL DEFAULT 'pending',
      "phone" text NOT NULL,
      "semester" text NOT NULL,
      "degree_program" text NOT NULL,
      "resume_path" text NOT NULL,
      "cover_letter" text,
      "feedback" text,
      "applied_at" timestamp DEFAULT CURRENT_TIMESTAMP,
      "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "internship_applications_status_check" 
        CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text]))
    );
    
    -- Add indexes for faster queries
    CREATE INDEX IF NOT EXISTS "internship_applications_internship_id_idx" ON "internship_applications"("internship_id");
    CREATE INDEX IF NOT EXISTS "internship_applications_student_id_idx" ON "internship_applications"("student_id");
    CREATE INDEX IF NOT EXISTS "internship_applications_status_idx" ON "internship_applications"("status");
  `);

  console.log("internship_applications table created successfully");
}

export async function down() {
  console.log("Dropping internship_applications table...");
  
  // Drop the internship_applications table
  await db.execute(sql`
    DROP TABLE IF EXISTS "internship_applications" CASCADE;
  `);

  console.log("internship_applications table dropped successfully");
} 