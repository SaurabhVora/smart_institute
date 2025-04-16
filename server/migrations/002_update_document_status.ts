import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  // Add filename column if it doesn't exist
  await client.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'filename'
      ) THEN
        ALTER TABLE documents ADD COLUMN filename TEXT;
        
        -- Update existing records to set filename from file_path
        UPDATE documents 
        SET filename = SUBSTRING(file_path FROM '[^/]+$')
        WHERE filename IS NULL;
        
        -- Make filename NOT NULL after populating data
        ALTER TABLE documents ALTER COLUMN filename SET NOT NULL;
      END IF;
    END $$;
  `);

  // Update the status column to use the new enum values
  await client.query(`
    -- First, update existing statuses to match new enum values
    UPDATE documents SET status = 'submitted' WHERE status = 'pending';
    
    -- Then alter the type constraint
    ALTER TABLE documents 
    DROP CONSTRAINT IF EXISTS documents_status_check;
    
    ALTER TABLE documents 
    ADD CONSTRAINT documents_status_check 
    CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected'));
  `);

  // Remove 'noc' from type enum
  await client.query(`
    -- Update any existing 'noc' documents to 'offer_letter'
    UPDATE documents SET type = 'offer_letter' WHERE type = 'noc';
    
    -- Then alter the type constraint
    ALTER TABLE documents 
    DROP CONSTRAINT IF EXISTS documents_type_check;
    
    ALTER TABLE documents 
    ADD CONSTRAINT documents_type_check 
    CHECK (type IN ('offer_letter', 'monthly_report', 'attendance'));
  `);
}

export async function down(client: PoolClient) {
  // Revert status enum changes
  await client.query(`
    ALTER TABLE documents 
    DROP CONSTRAINT IF EXISTS documents_status_check;
    
    ALTER TABLE documents 
    ADD CONSTRAINT documents_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
    
    -- Update statuses back to old values
    UPDATE documents SET status = 'pending' WHERE status IN ('draft', 'submitted', 'under_review');
  `);

  // Revert type enum changes
  await client.query(`
    ALTER TABLE documents 
    DROP CONSTRAINT IF EXISTS documents_type_check;
    
    ALTER TABLE documents 
    ADD CONSTRAINT documents_type_check 
    CHECK (type IN ('offer_letter', 'noc', 'monthly_report', 'attendance'));
  `);

  // We won't drop the filename column to avoid data loss
} 