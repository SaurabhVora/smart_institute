import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET_NAME
  );
}

/**
 * Upload a file to S3
 * @param filePath Local file path
 * @param customKey Optional custom key (path in S3)
 * @returns S3 object information
 */
export async function uploadFileToS3(filePath: string, customKey?: string): Promise<{ Key: string, Location: string }> {
  if (!isS3Configured()) {
    throw new Error('S3 is not properly configured. Check your environment variables.');
  }

  if (!filePath) {
    throw new Error('Invalid file path: File path is empty or undefined');
  }

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read file content
    const fileContent = fs.readFileSync(filePath);
    const fileSize = fileContent.length;

    // Generate key if not provided
    const key = customKey || `uploads/${path.basename(filePath)}`;

    // Get content type
    const contentType = getContentType(filePath);

    // Upload to S3
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    
    return {
      Key: key,
      Location: `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error(`S3 upload error:`, error);
    throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload a buffer directly to S3
 * @param buffer The buffer to upload
 * @param key S3 object key
 * @param contentType Optional content type
 * @returns S3 object information
 */
export async function uploadBufferToS3(buffer: Buffer, key: string, contentType?: string): Promise<{ Key: string, Location: string }> {
  if (!isS3Configured()) {
    throw new Error('S3 is not properly configured. Check your environment variables.');
  }

  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid buffer: Buffer is empty or undefined');
  }

  try {
    // Get content type if not provided
    const finalContentType = contentType || 
      (key.includes('.') ? getContentType(key) : 'application/octet-stream');

    // Upload to S3
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: finalContentType,
    };

    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    
    return {
      Key: key,
      Location: `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error(`S3 buffer upload error:`, error);
    throw new Error(`Failed to upload buffer to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a pre-signed URL for downloading a file
 * @param key S3 object key
 * @param expiresIn Expiration time in seconds (default: 3600)
 * @returns Pre-signed URL
 */
export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!key) {
    throw new Error('Invalid S3 key: Key is empty');
  }
  
  try {
    // Extract the filename from the key
    const filename = key.split('/').pop() || 'download';
    
    // Determine content type based on file extension
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    let contentType = 'application/octet-stream';
    
    // Map common extensions to content types
    const contentTypeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      '.csv': 'text/csv',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
    };
    
    if (fileExtension && contentTypeMap[fileExtension]) {
      contentType = contentTypeMap[fileExtension];
    }
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      // Add response headers to force download and set filename
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
      ResponseContentType: contentType,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error(`Error generating signed URL for key ${key}:`, error);
    throw new Error(`Failed to generate S3 signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from S3
 * @param key S3 object key
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  
  await s3Client.send(new DeleteObjectCommand(params));
}

/**
 * Get content type based on file extension
 * @param filePath File path
 * @returns Content type
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
  };
  
  return contentTypes[ext] || 'application/octet-stream';
} 