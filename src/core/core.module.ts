import { APP_FILTER } from '@nestjs/core';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import { SecurityModule } from './security/security.module';
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
    SecurityModule,
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
  exports: [SecurityModule],
})
export class CoreModule {}
