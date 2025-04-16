/**
 * Migrate files from local storage to AWS S3
 * 
 * Usage:
 * 1. Make sure your .env file has the correct AWS credentials and S3 bucket name
 * 2. Run: node scripts/migrate-to-s3.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { createReadStream } = require('fs');
const { fileTypeFromFile } = require('file-type');
const mime = require('mime-types');
const { Pool } = require('pg');

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuration
const uploadsDir = path.join(__dirname, '..', 'uploads');
const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Helper function to get MIME type
async function getMimeType(filePath) {
  try {
    const fileType = await fileTypeFromFile(filePath);
    if (fileType) {
      return fileType.mime;
    }
  } catch (error) {
    console.error(`Error detecting file type: ${error.message}`);
  }
  
  // Fallback to mime-types library
  return mime.lookup(filePath) || 'application/octet-stream';
}

// Upload a file to S3
async function uploadFileToS3(filePath, s3Key) {
  try {
    // Check if file already exists in S3
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
      }));
      console.log(`File already exists in S3: ${s3Key}`);
      return s3Key;
    } catch (error) {
      // File doesn't exist, continue with upload
    }

    const fileStream = createReadStream(filePath);
    const contentType = await getMimeType(filePath);
    
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileStream,
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`Successfully uploaded ${filePath} to ${s3Key}`);
    return s3Key;
  } catch (error) {
    console.error(`Error uploading file ${filePath}: ${error.message}`);
    throw error;
  }
}

// Update document record in database
async function updateDocumentRecord(table, idField, id, filePathField, newFileKey) {
  try {
    const query = `UPDATE ${table} SET ${filePathField} = $1 WHERE ${idField} = $2`;
    await pool.query(query, [newFileKey, id]);
    console.log(`Updated record in ${table} with ID ${id}`);
  } catch (error) {
    console.error(`Error updating record in ${table}: ${error.message}`);
    throw error;
  }
}

// Migrate documents
async function migrateDocuments() {
  try {
    // Get all documents from the database
    const documentsResult = await pool.query('SELECT id, file_path FROM documents');
    console.log(`Found ${documentsResult.rows.length} documents to migrate`);
    
    for (const doc of documentsResult.rows) {
      const localPath = doc.file_path;
      if (!localPath.startsWith('uploads/')) {
        console.log(`Document ${doc.id} already using S3 storage: ${localPath}`);
        continue;
      }
      
      const fullPath = path.join(__dirname, '..', localPath);
      
      try {
        // Check if file exists locally
        await stat(fullPath);
        
        // Generate S3 key (remove 'uploads/' prefix)
        const s3Key = localPath.replace('uploads/', '');
        
        // Upload to S3
        await uploadFileToS3(fullPath, s3Key);
        
        // Update database record
        await updateDocumentRecord('documents', 'id', doc.id, 'file_path', s3Key);
      } catch (error) {
        console.error(`Error processing document ${doc.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error migrating documents: ${error.message}`);
  }
}

// Migrate faculty documents
async function migrateFacultyDocuments() {
  try {
    // Get all faculty documents from the database
    const documentsResult = await pool.query('SELECT id, file_path FROM faculty_documents');
    console.log(`Found ${documentsResult.rows.length} faculty documents to migrate`);
    
    for (const doc of documentsResult.rows) {
      const localPath = doc.file_path;
      if (!localPath.startsWith('uploads/')) {
        console.log(`Faculty document ${doc.id} already using S3 storage: ${localPath}`);
        continue;
      }
      
      const fullPath = path.join(__dirname, '..', localPath);
      
      try {
        // Check if file exists locally
        await stat(fullPath);
        
        // Generate S3 key (remove 'uploads/' prefix and add faculty/ prefix)
        const s3Key = `faculty/${localPath.replace('uploads/', '')}`;
        
        // Upload to S3
        await uploadFileToS3(fullPath, s3Key);
        
        // Update database record
        await updateDocumentRecord('faculty_documents', 'id', doc.id, 'file_path', s3Key);
      } catch (error) {
        console.error(`Error processing faculty document ${doc.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error migrating faculty documents: ${error.message}`);
  }
}

// Main migration function
async function migrateToS3() {
  console.log('Starting migration to S3...');
  
  // Validate environment variables
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || 
      !process.env.AWS_REGION || !process.env.AWS_S3_BUCKET_NAME) {
    console.error('Missing required AWS environment variables. Check your .env file.');
    process.exit(1);
  }
  
  try {
    // Migrate regular documents
    await migrateDocuments();
    
    // Migrate faculty documents
    await migrateFacultyDocuments();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error(`Migration failed: ${error.message}`);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run the migration
migrateToS3().catch(console.error); 