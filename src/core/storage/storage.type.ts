import { PutObjectRequest, S3ClientConfig } from '@aws-sdk/client-s3';
import {
  FileMetadata,
  SaveOptions,
  StorageOptions,
} from '@google-cloud/storage';

export type StorageConfig = {
  diskStorage?: {
    root: string;
  };
  objectStorage?: {
    s3?: S3ClientConfig;
    gcloud?: StorageOptions;
  };
};

export type S3UploadOptions = Partial<PutObjectRequest> & {
  config?: S3ClientConfig;
  fileName?: string;
  uploadedFile: Express.Multer.File;
};

export type GCloudUploadOptions = {
  config?: StorageOptions;
  fileName?: string;
  uploadedFile: Express.Multer.File;
  Bucket?: string;
  fileOptions?: FileMetadata;
  saveOptions?: SaveOptions;
  metadataOptions?: FileMetadata;
};
