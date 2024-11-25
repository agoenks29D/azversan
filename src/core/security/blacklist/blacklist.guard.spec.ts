import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BlacklistGuard } from './blacklist.guard';
import { BlacklistService } from './blacklist.service';

describe('BlacklistGuard', () => {
  let guard: BlacklistGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Logger,
        ConfigService,
        BlacklistGuard,
        BlacklistService,
        {
          provide: 'BLACKLIST',
          useValue: [],
        },
      ],
    }).compile();

    guard = module.get<BlacklistGuard>(BlacklistGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
