/**
 * Migration script to move resume files from local storage to S3
 * and update the database paths accordingly
 * 
 * Usage: 
 * npx tsx server/scripts/migrate-resume-paths.ts
 */

import { db } from '../db';
import { internshipApplications } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';
import { createStorageService } from '../services/storage-service';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

// Create storage service (will be S3 if configured)
const storageService = createStorageService();

async function main() {
  console.log('Starting resume migration...');
  
  // Get all applications with resume paths
  const applications = await db
    .select()
    .from(internshipApplications)
    .where(
      // Only select applications with resume paths that start with /uploads
      // which indicates they are using the old local storage path format
      eq(true, true) // We'll filter in JS below
    );
  
  console.log(`Found ${applications.length} applications total`);
  
  // Filter applications with old-style paths
  const applicationsToMigrate = applications.filter(app => 
    app.resumePath && app.resumePath.startsWith('/uploads')
  );
  
  console.log(`Found ${applicationsToMigrate.length} applications to migrate`);
  
  // Process each application
  for (const application of applicationsToMigrate) {
    try {
      const oldPath = application.resumePath;
      console.log(`Processing application ${application.id} with path ${oldPath}`);
      
      // Convert absolute path to file system path
      const localFilePath = path.join(process.cwd(), oldPath.substring(1)); // Remove leading slash
      
      // Check if file exists
      if (!(await exists(localFilePath))) {
        console.log(`⚠️ File not found at ${localFilePath}, skipping`);
        continue;
      }
      
      // Read file
      const fileBuffer = await readFile(localFilePath);
      
      // Extract file information
      const filename = path.basename(localFilePath);
      
      // Create a more user-friendly filename
      // Extract student ID and timestamp from the original pattern (studentId_timestamp.ext)
      const filenameParts = filename.split('_');
      const fileExtension = path.extname(filename);
      let newFilename = filename;
      
      // If the filename follows the pattern studentId_timestamp.ext
      if (filenameParts.length === 2 && filenameParts[1].includes('.')) {
        const timestamp = filenameParts[1].split('.')[0];
        // Use only the timestamp as prefix
        newFilename = `${timestamp}_resume${fileExtension}`;
      }
      
      // Determine content type based on extension
      const lowerExtension = fileExtension.toLowerCase();
      let contentType = 'application/octet-stream'; // Default
      
      if (lowerExtension === '.pdf') contentType = 'application/pdf';
      else if (lowerExtension === '.doc') contentType = 'application/msword';
      else if (lowerExtension === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      // Upload to S3
      const newPath = `resumes/${newFilename}`;
      const s3Path = await storageService.saveFile(newPath, fileBuffer, contentType);
      
      console.log(`✅ Uploaded to S3 as ${s3Path}`);
      
      // Update database - store just the S3 key path, not a full URL
      await db
        .update(internshipApplications)
        .set({ resumePath: s3Path })
        .where(eq(internshipApplications.id, application.id));
      
      console.log(`✅ Updated database record for application ${application.id}`);
    } catch (error) {
      console.error(`❌ Error processing application ${application.id}:`, error);
    }
  }
  
  console.log('Migration completed!');
}

main()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 