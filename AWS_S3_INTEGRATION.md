# AWS S3 Integration for Document Storage

This document outlines how AWS S3 is integrated into the Industry Link Portal for document storage.

## Overview

The application supports two storage types:
- **Local Storage**: Files are stored on the local filesystem
- **AWS S3 Storage**: Files are stored in an Amazon S3 bucket

The storage type is controlled by the `STORAGE_TYPE` environment variable, which can be set to either `local` or `s3`.

## Configuration

To use AWS S3 storage, you need to set the following environment variables in your `.env` file:

```
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_bucket_name
```

## AWS Setup Instructions

### 1. Create an AWS Account

If you don't already have an AWS account, sign up at [https://aws.amazon.com/](https://aws.amazon.com/).

### 2. Create an S3 Bucket

1. Sign in to the AWS Management Console
2. Navigate to the S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `smartinstitute-documents`)
5. Select the AWS Region closest to your users
6. Configure bucket settings:
   - Block all public access (recommended for security)
   - Enable versioning (optional but recommended)
   - Enable server-side encryption (recommended)
7. Click "Create bucket"

### 3. Create IAM User with S3 Access

1. Navigate to the IAM service in the AWS Console
2. Go to "Users" and click "Add user"
3. Choose a username (e.g., `smartinstitute-app`)
4. Select "Programmatic access" for Access type
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select "AmazonS3FullAccess" (or create a custom policy with more limited permissions)
8. Click through the remaining steps and create the user
9. **Important**: Save the Access Key ID and Secret Access Key that are displayed. You will need these for your `.env` file.

## Implementation Details

### Storage Service Factory

The application uses a storage service factory pattern to abstract the storage implementation:

```javascript
// server/services/storage-service.ts
const storageService = process.env.STORAGE_TYPE === 's3' 
  ? new S3StorageService() 
  : new LocalStorageService();
```

### S3 Storage Service

The S3 storage service handles file operations using the AWS SDK:

- **Upload**: Uploads files to S3 and returns the file key
- **Download**: Generates pre-signed URLs for file downloads
- **Delete**: Removes files from S3

### Document Storage Service

The document storage service provides higher-level functions for document management:

- `saveDocumentFile`: Saves a document file to storage
- `getDocumentFileUrl`: Retrieves a URL for downloading a document
- `deleteDocumentFile`: Deletes a document file from storage
- `saveFacultyDocumentFile`: Saves a faculty document file to storage

## Client-Side Implementation

The client-side code handles both local and S3 storage types:

- For S3 storage, the server returns a redirect to a pre-signed URL
- For local storage, the server streams the file directly

The download handler in the client code detects which type of response it received and handles it accordingly. This functionality has been implemented in:

- Faculty Documents component
- Student Documents page
- Document Review page
- Document Details dialog

This ensures consistent download behavior across all parts of the application, regardless of the storage type being used.

## Migrating from Local Storage to S3

The application includes a migration script to help you move existing files from local storage to S3. This is useful when you want to switch from local storage to S3 for an existing deployment.

### Prerequisites for Migration

1. Make sure your AWS credentials and S3 bucket are properly configured in your `.env` file
2. Install the required dependencies:
   ```
   npm install
   ```

### Running the Migration

To migrate all existing documents from local storage to S3, run:

```
npm run migrate:s3
```

The script will:
1. Connect to your database to find all document records
2. For each document with a local file path:
   - Upload the file to S3
   - Update the database record with the new S3 file key
3. Log the progress and any errors encountered

### After Migration

After running the migration script:

1. Verify that all documents were successfully migrated by checking the logs
2. Update your `.env` file to set `STORAGE_TYPE=s3`
3. Restart your application

The local files will remain in the `uploads` directory after migration. You can keep them as a backup or delete them once you've verified that everything is working correctly with S3.

## Security Considerations

- S3 bucket is configured to block all public access
- Pre-signed URLs are used for secure, time-limited access to files
- IAM permissions follow the principle of least privilege
- Server-side encryption is enabled for data at rest

## CORS Configuration for S3 Bucket

If you're experiencing issues with document downloads, you may need to configure CORS (Cross-Origin Resource Sharing) for your S3 bucket. This is especially important when using pre-signed URLs for downloads.

To configure CORS for your S3 bucket:

1. Sign in to the AWS Management Console
2. Navigate to the S3 service
3. Select your bucket
4. Click on the "Permissions" tab
5. Scroll down to the "Cross-origin resource sharing (CORS)" section
6. Click "Edit"
7. Add the following CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:5000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Content-Disposition"],
    "MaxAgeSeconds": 3600
  }
]
```

Make sure to replace `https://yourdomain.com` with your actual production domain.

This configuration allows your application to:
- Access files from your S3 bucket
- Receive important headers like Content-Disposition (needed for filenames)
- Work correctly in both development and production environments

## Troubleshooting

If you encounter issues with S3 integration:

1. Verify your AWS credentials are correct in the `.env` file
2. Check that the S3 bucket exists and is in the correct region
3. Ensure the IAM user has sufficient permissions to access the bucket
4. Check server logs for AWS SDK error messages
5. Verify that `STORAGE_TYPE` is set to `s3` in your `.env` file

## Switching Between Storage Types

To switch between storage types:

1. Update the `STORAGE_TYPE` environment variable in your `.env` file
2. Restart the application

Note that existing files will not be automatically migrated between storage types. Use the migration script described above if you need to migrate existing files. 