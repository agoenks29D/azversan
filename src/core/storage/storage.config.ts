import { join } from 'node:path';
import { registerAs } from '@nestjs/config';
import { StorageConfig } from './storage.type';

export default registerAs<StorageConfig>('storage', () => {
  const config: StorageConfig = {
    diskStorage: {
      root: process.env.DISK_STORAGE_ROOT || join(process.cwd(), 'storage'),
    },
    objectStorage: {
      s3: {
        endpoint: process.env.S3_ENPOINT,
        region: process.env.S3_REGION,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
      },
      gcloud: {
        keyFilename: join(process.cwd(), process.env.GCLOUD_KEY_FILE),
      },
    },
  };

  return config;
});
