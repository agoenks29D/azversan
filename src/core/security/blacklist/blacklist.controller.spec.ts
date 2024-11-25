import { Test, TestingModule } from '@nestjs/testing';
import { BlacklistController } from './blacklist.controller';

describe('BlacklistController', () => {
  let controller: BlacklistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlacklistController],
    }).compile();

    controller = module.get<BlacklistController>(BlacklistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
