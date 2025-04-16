import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { storageService } from './storage-service';

// Promisify fs functions
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);

/**
 * Save a document file to storage
 * @param filePath Local file path
 * @param documentType Type of document
 * @param filename Original filename
 * @returns Storage key for the saved file
 */
export async function saveDocumentFile(filePath: string, documentType: string, filename: string): Promise<string> {
  try {
    // Generate a custom key with a folder structure based on document type
    const timestamp = Date.now();
    const customKey = `documents/${documentType}/${timestamp}-${filename}`;
    
    // Save the file using the storage service
    return await storageService.saveFile(filePath, customKey);
  } catch (error) {
    console.error('Error saving document file:', error);
    throw error;
  }
}

/**
 * Get a document file URL for download
 * @param fileKey Storage key for the file
 * @returns URL for downloading the file
 */
export async function getDocumentFileUrl(fileKey: string): Promise<string> {
  if (!fileKey) {
    throw new Error('Invalid file key: The document does not have a valid file path');
  }

  try {
    // Check if this is a local file path that doesn't exist
    if (process.env.STORAGE_TYPE !== 's3' && !fileKey.startsWith('documents/')) {
      // For local storage, check if the file exists
      const exists = await existsAsync(fileKey);
      if (!exists) {
        throw new Error(`File not found: ${fileKey}`);
      }
    }
    
    const url = await storageService.getFileUrl(fileKey);
    return url;
  } catch (error) {
    console.error(`Error getting document file URL:`, error);
    throw new Error(`Failed to get document URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a document file from storage
 * @param fileKey Storage key for the file
 */
export async function deleteDocumentFile(fileKey: string): Promise<void> {
  try {
    await storageService.deleteFile(fileKey);
  } catch (error) {
    console.error('Error deleting document file:', error);
    throw error;
  }
}

/**
 * Save a faculty document file to storage
 * @param filePath Local file path
 * @param filename Original filename
 * @returns Storage key for the saved file
 */
export async function saveFacultyDocumentFile(filePath: string, filename: string): Promise<string> {
  try {
    // Generate a custom key with a folder structure
    const timestamp = Date.now();
    const customKey = `faculty-documents/${timestamp}-${filename}`;
    
    // Save the file using the storage service
    return await storageService.saveFile(filePath, customKey);
  } catch (error) {
    console.error('Error saving faculty document file:', error);
    throw error;
  }
} 