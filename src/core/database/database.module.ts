import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { AllConfigType } from '@/app.type';
import databaseConfig from './database.config';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AllConfigType>) => {
        return configService.get<SequelizeModuleOptions>('database');
      },
    }),
  ],
  providers: [Logger],
})
export class DatabaseModule implements OnApplicationBootstrap {
  constructor(
    private logger: Logger,
    private configService: ConfigService,
  ) {}

  onApplicationBootstrap() {
    /**
     * Database config
     */
    const config = this.configService.get<SequelizeModuleOptions>('database');

    /**
     * Logging
     */
    this.logger.log(`Dialect: ${config.dialect}`, DatabaseModule.name);
    this.logger.log(`Timezone: ${config.timezone}`, DatabaseModule.name);
  }
}
