import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Set up file utils
const mkdir = promisify(fs.mkdir);

// Define upload directories
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
export const RESUME_DIR = path.join(UPLOADS_DIR, 'resumes');

/**
 * Ensures that all necessary upload directories exist
 */
export async function ensureUploadDirs() {
  try {
    // Create base uploads directory
    await mkdir(UPLOADS_DIR, { recursive: true });
    
    // Create resume directory
    await mkdir(RESUME_DIR, { recursive: true });
    
    console.log('Upload directories created/verified');
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
}

/**
 * Generates a unique filename for an uploaded file
 */
export function generateUniqueFilename(originalname: string, prefix: string = '') {
  const timestamp = Date.now();
  const fileExtension = path.extname(originalname);
  return `${prefix}${timestamp}${fileExtension}`;
} 