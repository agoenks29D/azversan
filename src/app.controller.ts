import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './core/storage/storage.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private storageService: StorageService,
  ) {}

  @Get()
  async serverInfo() {
    const serverInfo = await this.appService.getServerInfo();
    return serverInfo;
  }

  @Post('gcloud')
  @UseInterceptors(FileInterceptor('file'))
  async uploadGcloud(@UploadedFile() uploadedFile: Express.Multer.File) {
    const storage = await this.storageService.gCloudUpload({
      uploadedFile,
      saveOptions: {
        public: true,
      },
      metadataOptions: {
        metadata: {
          CustomMetadata1: 'MyCustomMetadata1',
          CustomMetadata2: 'MyCustomMetadata2',
        },
      },
    });

    return storage;
  }

  @Post('s3')
  @UseInterceptors(FileInterceptor('file'))
  async uploadS3(@UploadedFile() uploadedFile: Express.Multer.File) {
    const storage = await this.storageService.s3Upload({
      uploadedFile,
      Metadata: {
        CustomMetadata1: 'MyCustomMetadata1',
        CustomMetadata2: 'MyCustomMetadata2',
      },
    });

    return storage;
  }

  @Post('local')
  @UseInterceptors(FileInterceptor('file'))
  async localDrive(@UploadedFile() uploadedFile: Express.Multer.File) {
    const storage = await this.storageService.localDrive({
      uploadedFile,
      directory: 'custom/path',
    });
    return storage;
  }
}
