import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from '@/app.type';
import { UserEntity } from './user.entity';

/**
 * Get authenticated user.
 */
export const AuthenticatedUser = createParamDecorator(
  (data: keyof UserEntity, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (data) {
      return req.user[data];
    }

    return req.user;
  },
);
