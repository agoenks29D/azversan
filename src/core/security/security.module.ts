import { APP_GUARD } from '@nestjs/core';
import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AllConfigType } from '@/app.type';
import { APIKeyGuard } from './api-key/api-key.guard';
import { APIKeyService } from './api-key/api-key.service';
import { BlacklistGuard } from './blacklist/blacklist.guard';
import { BlacklistService } from './blacklist/blacklist.service';
import { BearerTokenGuard } from './bearer-token/bearer-token.guard';
import { SecurityConfig } from './security.type';
import securityConfig from './security.config';

@Module({
  imports: [
    ConfigModule.forFeature(securityConfig),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AllConfigType>) => {
        const { jwtSecretKey, jwtExpiration } =
          configService.get<SecurityConfig>('security');
        return {
          secret: jwtSecretKey,
          signOptions: {
            expiresIn: jwtExpiration,
          },
        };
      },
    }),
  ],
  providers: [
    Logger,
    APIKeyService,
    BlacklistService,
    {
      provide: 'API_KEYS',
      useValue: [],
    },
    {
      provide: 'BLACKLIST',
      useValue: [],
    },
    {
      provide: APP_GUARD,
      useClass: APIKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BlacklistGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BearerTokenGuard,
    },
  ],
  exports: [JwtModule, APIKeyService, BlacklistService],
})
export class SecurityModule implements OnApplicationBootstrap {
  constructor(
    private logger: Logger,
    private configService: ConfigService,
  ) {}

  onApplicationBootstrap() {
    /**
     * Security config
     */
    const config = this.configService.get<SecurityConfig>('security');

    /**
     * Logging
     */
    this.logger.log(
      `API key guard: ${config.apiKeyAuthEnable === true ? 'active' : 'non-active'}`,
      SecurityModule.name,
    );
    this.logger.log(
      `Blacklist guard: ${config.blacklistEnable === true ? 'active' : 'non-active'}`,
      SecurityModule.name,
    );
    this.logger.log(
      `Bearer token guard: ${config.jwtEnable === true ? 'active' : 'non-active'}`,
      SecurityModule.name,
    );
  }
}
