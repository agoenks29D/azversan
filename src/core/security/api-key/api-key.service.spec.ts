import { Test, TestingModule } from '@nestjs/testing';
import { APIKeyService } from './api-key.service';

describe('APIKeyService', () => {
  let service: APIKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        APIKeyService,
        {
          provide: 'API_KEYS',
          useValue: [],
        },
      ],
    }).compile();

    service = module.get<APIKeyService>(APIKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
