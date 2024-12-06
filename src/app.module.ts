import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { AppController } from './app.controller';
import { AppMiddleware } from './app.middleware';
import { AppService } from './app.service';
import { AppConfig } from './app.type';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';

@Module({
  imports: [CoreModule, AuthModule, UserModule],
  controllers: [AppController],
  providers: [Logger, AppService],
})
export class AppModule implements NestModule, OnApplicationBootstrap {
  constructor(
    private logger: Logger,
    private configService: ConfigService,
  ) {}

  /**
   * Apply middleware
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes('*');
  }

  onApplicationBootstrap() {
    const environment = this.configService.get<AppConfig>('environment');
    /**
     * Logging
     */
    this.logger.log(`Environment: ${environment}`, AppModule.name);
    this.logger.log(
      `HTTPS enabled: ${this.configService.get('ENABLE_HTTPS')}`,
      AppModule.name,
    );
    this.logger.log(
      `System timezone: ${this.configService.get('TZ')}`,
      AppModule.name,
    );
  }
}
