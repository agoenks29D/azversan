import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mimeTypes from 'mime-types';
import {
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Storage, StorageOptions } from '@google-cloud/storage';
import {
  GCloudUploadOptions,
  S3UploadOptions,
  StorageConfig,
} from './storage.type';
import { randomString } from '../framework/helpers';

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {}

  /**
   * Initializes and returns an instance of S3Client.
   * @param options Optional S3Client configuration.
   */
  s3(options?: S3ClientConfig) {
    const { objectStorage } = this.configService.get<StorageConfig>('storage');
    return new S3Client(options || objectStorage.s3);
  }

  /**
   * Uploads a file to AWS S3 and returns details about the uploaded file.
   * @param options Options for uploading to S3.
   */
  async s3Upload(
    options: S3UploadOptions,
  ): Promise<{ url: string; key: string; bucket: string }> {
    const config = this.configService.get<StorageConfig>('storage');
    const Key = options.fileName || randomString();
    const Bucket = options.Bucket || this.configService.get('S3_BUCKET');
    const command = new PutObjectCommand({
      Key,
      Bucket,
      Body: options.uploadedFile.buffer,
      Metadata: options.Metadata,
      ContentType: options.uploadedFile.mimetype,
      ContentDisposition: options.ContentDisposition || 'inline',
      ACL: options.ACL || ObjectCannedACL.public_read,
    });
    await this.s3(options.config).send(command);

    return {
      url: `${config.objectStorage.s3.endpoint}/${Bucket}/${Key}`,
      key: Key,
      bucket: Bucket,
    };
  }

  /**
   * Generates a presigned URL for accessing a file in S3.
   * @param Key The key of the object in S3.
   * @param Bucket Optional bucket name; will use default if not provided.
   * @param expiresIn Optional expiration time for the presigned URL.
   */
  async s3GeneratePresignedUrl(
    Key: string,
    Bucket?: string,
    expiresIn?: number,
  ): Promise<string> {
    Bucket = Bucket || this.configService.get('S3_BUCKET');
    const command = new GetObjectCommand({
      Key,
      Bucket,
    });
    const preSignedUrl = await getSignedUrl(this.s3(), command, { expiresIn });

    return preSignedUrl;
  }

  /**
   * Initializes and returns an instance of Google Cloud Storage.
   * @param options Optional StorageOptions configuration.
   */
  gCloud(options?: StorageOptions) {
    const { objectStorage } = this.configService.get<StorageConfig>('storage');
    return new Storage(options || objectStorage.gcloud);
  }

  /**
   * Uploads a file to Google Cloud Storage and returns details about the uploaded file.
   * @param options Options for uploading to Google Cloud Storage.
   */
  async gCloudUpload(
    options: GCloudUploadOptions,
  ): Promise<{ url: string; key: string; bucket: string }> {
    const fileName = options.fileName || randomString();
    const bucketName =
      options.Bucket || this.configService.get('GCLOUD_BUCKET');
    const gcloud = this.gCloud().bucket(bucketName).file(fileName);

    await gcloud.save(options.uploadedFile.buffer, {
      contentType: options.uploadedFile.mimetype,
      ...options.saveOptions,
    });

    if (options.metadataOptions) {
      await gcloud.setMetadata(options.metadataOptions);
    }

    return {
      url: `https://storage.googleapis.com/${bucketName}/${fileName}`,
      key: fileName,
      bucket: bucketName,
    };
  }

  /**
   * Uploads a file to the local disk.
   * @param options Options for uploading to local storage.
   */
  async localDrive(options: {
    uploadedFile: Express.Multer.File;
    directory?: string;
    fileName?: string;
  }): Promise<{ filePath: string; fileName: string }> {
    const diskStorageRoot = this.configService.get(
      'DISK_STORAGE_ROOT',
      'storage',
    );
    const directory = join(diskStorageRoot, options.directory);
    const extension = mimeTypes.extension(options.uploadedFile.mimetype);
    const fileName = `${options.fileName || randomString()}${extension ? `.${extension}` : ''}`;
    const filePath = join(directory, fileName);

    mkdirSync(directory, { recursive: true });
    writeFileSync(filePath, options.uploadedFile.buffer);

    return {
      filePath,
      fileName,
    };
  }
}
