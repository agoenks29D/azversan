import { Reflector } from '@nestjs/core';

export const DisableAPIKey = Reflector.createDecorator<boolean>({
  transform: (value) => (typeof value === 'undefined' ? true : value),
});
