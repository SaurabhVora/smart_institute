/**
 * Script to update resume filenames in S3 bucket to better preserve original names
 * 
 * Usage: 
 * npx tsx server/scripts/update-resume-filenames.ts
 */

import { db } from '../db';
import { internshipApplications, users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';
import { createStorageService } from '../services/storage-service';
import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { isS3Configured } from '../services/s3-storage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure AWS SDK
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

// Create storage service (will be S3 if configured)
const storageService = createStorageService();

// Map of file extensions to their expected mime types
const contentTypeMap: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

async function listS3Files(prefix: string = 'resumes/'): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });
    
    const response = await s3Client.send(command);
    return (response.Contents || []).map(item => item.Key || '');
  } catch (error) {
    console.error('Error listing S3 files:', error);
    return [];
  }
}

async function copyS3File(oldKey: string, newKey: string): Promise<boolean> {
  try {
    // Determine content type based on extension
    const fileExtension = path.extname(newKey).toLowerCase();
    const contentType = contentTypeMap[fileExtension] || 'application/octet-stream';
    
    // Copy the object
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`,
      Key: newKey,
      ContentType: contentType,
    });
    
    await s3Client.send(copyCommand);
    
    // Delete the old object
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldKey,
    });
    
    await s3Client.send(deleteCommand);
    return true;
  } catch (error) {
    console.error(`Error copying S3 file from ${oldKey} to ${newKey}:`, error);
    return false;
  }
}

async function updateDatabasePath(applicationId: number, newPath: string): Promise<boolean> {
  try {
    await db
      .update(internshipApplications)
      .set({ resumePath: newPath })
      .where(eq(internshipApplications.id, applicationId));
    return true;
  } catch (error) {
    console.error(`Error updating database for application ${applicationId}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting resume filename update process...');
  
  if (!isS3Configured()) {
    console.error('S3 is not properly configured. Check your environment variables.');
    return;
  }
  
  // Get all applications with resume paths
  const applications = await db
    .select()
    .from(internshipApplications);
  
  console.log(`Found ${applications.length} applications total`);
  
  // Get all files in the S3 bucket with the resumes/ prefix
  const s3Files = await listS3Files('resumes/');
  console.log(`Found ${s3Files.length} files in S3 resumes/ folder`);
  
  // Process each application
  let updatedCount = 0;
  
  for (const application of applications) {
    try {
      const currentPath = application.resumePath;
      
      // Skip if no resume path or already in the new format (timestamp-filename.ext)
      if (!currentPath || !currentPath.includes('resumes/') || currentPath.includes('-')) {
        continue;
      }
      
      console.log(`Processing application ${application.id} with path ${currentPath}`);
      
      // Extract filename parts
      const filename = path.basename(currentPath);
      const filenameParts = filename.split('_');
      const fileExtension = path.extname(filename);
      
      // Only process files with format like "studentId_timestamp.ext"
      if (filenameParts.length !== 2 || !filenameParts[1].includes('.')) {
        console.log(`Skipping file with unexpected format: ${filename}`);
        continue;
      }
      
      // Extract student ID and timestamp
      const studentId = filenameParts[0];
      const timestamp = filenameParts[1].split('.')[0];
      
      // Get student name from database if possible
      const studentInfo = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(studentId)))
        .limit(1);
      
      // Create the new filename with timestamp-resumename.ext format
      let newFilename: string;
      if (studentInfo && studentInfo.length > 0 && studentInfo[0].name) {
        // Use student name if available
        const sanitizedName = studentInfo[0].name.replace(/[/\\?%*:|"<>]/g, '_');
        newFilename = `${timestamp}-${sanitizedName}_Resume${fileExtension}`;
      } else {
        // Fallback to generic name
        newFilename = `${timestamp}-Student_${studentId}_Resume${fileExtension}`;
      }
      
      const newPath = `resumes/${newFilename}`;
      console.log(`Renaming to: ${newPath}`);
      
      // Copy file in S3 with new name
      const copyResult = await copyS3File(currentPath, newPath);
      if (!copyResult) {
        console.log(`⚠️ Failed to copy file in S3, skipping database update`);
        continue;
      }
      
      // Update database record
      const updateResult = await updateDatabasePath(application.id, newPath);
      if (updateResult) {
        console.log(`✅ Successfully updated application ${application.id}`);
        updatedCount++;
      } else {
        console.log(`⚠️ Failed to update database for application ${application.id}`);
      }
    } catch (error) {
      console.error(`❌ Error processing application ${application.id}:`, error);
    }
  }
  
  console.log(`Updated ${updatedCount} out of ${applications.length} applications`);
  console.log('Update process completed!');
}

main()
  .then(() => {
    console.log('File update script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('File update script failed:', error);
    process.exit(1);
  }); 