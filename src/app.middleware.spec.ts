import { Logger } from '@nestjs/common';
import { AppMiddleware } from './app.middleware';

describe('AppMiddleware', () => {
  it('should be defined', () => {
    expect(new AppMiddleware(new Logger())).toBeDefined();
  });
});
