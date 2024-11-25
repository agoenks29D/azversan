import { Reflector } from '@nestjs/core';

export const DisableBearerToken = Reflector.createDecorator<boolean>({
  transform: (value) => (typeof value === 'undefined' ? true : value),
});
