import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import appConfig from '@/app.config';
import { SecurityModule } from './security.module';

describe('SecurityModule', () => {
  let securityModule: TestingModule;

  beforeAll(async () => {
    securityModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig],
        }),
        JwtModule.registerAsync({
          global: true,
          useFactory: () => ({
            global: true,
            secret: 'JWTSecret',
          }),
        }),
        SecurityModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(securityModule).toBeDefined();
  });
});
