import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BearerTokenGuard } from './bearer-token.guard';

describe('BearerTokenGuard', () => {
  let guard: BearerTokenGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Logger, ConfigService, BearerTokenGuard, JwtService],
    }).compile();

    guard = module.get<BearerTokenGuard>(BearerTokenGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
