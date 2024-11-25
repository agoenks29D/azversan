import { APP_FILTER } from '@nestjs/core';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import { DatabaseModule } from './database/database.module';
import { SecurityModule } from './security/security.module';
import { StorageModule } from './storage/storage.module';
import { AllExceptionFilter, HttpExceptionFilter } from './framework/filters';
import appConfig, { winstonConfigFactory } from '@/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: winstonConfigFactory,
    }),
    ScheduleModule.forRoot({
      cronJobs: true,
      intervals: true,
      timeouts: true,
    }),
    EventEmitterModule.forRoot({ global: true }),
    DatabaseModule,
    SecurityModule,
    StorageModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [SecurityModule, StorageModule],
})
export class CoreModule {}
