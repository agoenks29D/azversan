import { Reflector } from '@nestjs/core';

export const DisableBlacklist = Reflector.createDecorator<boolean>({
  transform: (value) => (typeof value === 'undefined' ? true : value),
});
