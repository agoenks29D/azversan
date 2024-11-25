import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APIKeyGuard } from './api-key.guard';
import { APIKeyService } from './api-key.service';

describe('APIKeyGuard', () => {
  let guard: APIKeyGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Logger,
        APIKeyGuard,
        APIKeyService,
        ConfigService,
        {
          provide: 'API_KEYS',
          useValue: [],
        },
      ],
    }).compile();

    guard = module.get<APIKeyGuard>(APIKeyGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
