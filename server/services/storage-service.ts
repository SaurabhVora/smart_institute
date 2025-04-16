import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { uploadFileToS3, getSignedDownloadUrl, deleteFileFromS3, isS3Configured, uploadBufferToS3 } from './s3-storage';

// Promisify fs functions
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const writeFileAsync = promisify(fs.writeFile);

// Storage types
export type StorageType = 'local' | 's3';

// Storage interface
export interface IStorageService {
  saveFile(filePath: string, fileDataOrPath?: Buffer | string, contentType?: string): Promise<string>;
  getFileUrl(fileKey: string): Promise<string>;
  deleteFile(fileKey: string): Promise<void>;
}

// Local file storage implementation
class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    console.log(`Local storage initialized with upload directory: ${this.uploadDir}`);
  }

  async saveFile(filePath: string, fileDataOrPath?: Buffer | string, contentType?: string): Promise<string> {
    console.log(`Saving file to local storage: ${filePath}`);
    
    // If filePath is a full path and no buffer is provided, just return the path
    if (!fileDataOrPath && await existsAsync(filePath)) {
      return filePath;
    }
    
    // Ensure the directory structure exists
    const fullPath = path.join(this.uploadDir, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // If fileDataOrPath is a buffer, write it to the file
    if (fileDataOrPath instanceof Buffer) {
      await writeFileAsync(fullPath, fileDataOrPath);
      return `/uploads/${filePath}`;
    }
    
    // If fileDataOrPath is a string path, copy the file
    if (typeof fileDataOrPath === 'string' && await existsAsync(fileDataOrPath)) {
      const fileContent = fs.readFileSync(fileDataOrPath);
      await writeFileAsync(fullPath, fileContent);
      return `/uploads/${filePath}`;
    }
    
    throw new Error('Invalid file data or path');
  }

  async getFileUrl(fileKey: string): Promise<string> {
    console.log(`Getting URL for file: ${fileKey}`);
    
    // If fileKey starts with /uploads, it's already a URL path
    if (fileKey.startsWith('/uploads/')) {
      return fileKey;
    }
    
    // Otherwise, construct a URL path from the key
    return `/uploads/${path.basename(fileKey)}`;
  }

  async deleteFile(fileKey: string): Promise<void> {
    console.log(`Deleting file: ${fileKey}`);
    
    // Handle paths that start with /uploads/
    let fullPath = fileKey;
    if (fileKey.startsWith('/uploads/')) {
      fullPath = path.join(process.cwd(), fileKey);
    } else {
      fullPath = path.join(this.uploadDir, fileKey);
    }
    
    if (await existsAsync(fullPath)) {
      await unlinkAsync(fullPath);
      console.log(`File deleted: ${fullPath}`);
    } else {
      console.warn(`File not found for deletion: ${fullPath}`);
    }
  }
}

// S3 storage implementation
class S3StorageService implements IStorageService {
  constructor() {
    console.log('S3 storage service initialized');
    if (!isS3Configured()) {
      console.warn('S3 is not properly configured. Check your environment variables.');
    }
  }
  
  async saveFile(fileKey: string, fileDataOrPath?: Buffer | string, contentType?: string): Promise<string> {
    console.log(`Saving file to S3 with key: ${fileKey}`);
    
    try {
      let result;
      
      // If fileDataOrPath is a Buffer, upload directly to S3
      if (fileDataOrPath instanceof Buffer) {
        result = await uploadBufferToS3(fileDataOrPath, fileKey, contentType);
      }
      // If fileDataOrPath is a string path, upload the file from disk
      else if (typeof fileDataOrPath === 'string' && await existsAsync(fileDataOrPath)) {
        result = await uploadFileToS3(fileDataOrPath, fileKey);
        
        // Delete the local temp file after successful upload
        try {
          await unlinkAsync(fileDataOrPath);
          console.log(`Deleted local temp file: ${fileDataOrPath}`);
        } catch (error) {
          console.warn(`Failed to delete local temp file ${fileDataOrPath}:`, error);
        }
      }
      // If no fileDataOrPath is provided, check if fileKey is a local path
      else if (!fileDataOrPath && await existsAsync(fileKey)) {
        result = await uploadFileToS3(fileKey);
        
        // Delete the local temp file after successful upload
        try {
          await unlinkAsync(fileKey);
          console.log(`Deleted local temp file: ${fileKey}`);
        } catch (error) {
          console.warn(`Failed to delete local temp file ${fileKey}:`, error);
        }
      }
      else {
        throw new Error('Invalid file data or path');
      }
      
      console.log(`File uploaded to S3 with key: ${result.Key}`);
      return result.Key;
    } catch (error) {
      console.error(`Failed to upload file to S3:`, error);
      throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFileUrl(fileKey: string): Promise<string> {
    console.log(`Getting S3 URL for key: ${fileKey}`);
    try {
      // If the key starts with /uploads, extract just the filename portion
      if (fileKey.startsWith('/uploads/')) {
        const parts = fileKey.split('/');
        if (parts.length >= 3) {
          // Get the type (e.g., 'resumes') and filename
          const type = parts[parts.length - 2];
          const filename = parts[parts.length - 1];
          fileKey = `${type}/${filename}`;
          console.log(`Converted path to S3 key: ${fileKey}`);
        }
      }
      
      const url = await getSignedDownloadUrl(fileKey);
      return url;
    } catch (error) {
      console.error(`Failed to get S3 URL for key ${fileKey}:`, error);
      throw new Error(`S3 URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    console.log(`Deleting file from S3: ${fileKey}`);
    try {
      await deleteFileFromS3(fileKey);
      console.log(`File deleted from S3: ${fileKey}`);
    } catch (error) {
      console.error(`Failed to delete file from S3 ${fileKey}:`, error);
      throw new Error(`S3 deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Storage factory
export function createStorageService(): IStorageService {
  const storageType = process.env.STORAGE_TYPE as StorageType || 'local';
  
  if (storageType === 's3' && isS3Configured()) {
    console.log('Using S3 storage service');
    return new S3StorageService();
  } else {
    if (storageType === 's3') {
      console.warn('S3 storage requested but not properly configured. Falling back to local storage.');
    } else {
      console.log('Using local storage service');
    }
    return new LocalStorageService();
  }
}

// Export a singleton instance
export const storageService = createStorageService(); 