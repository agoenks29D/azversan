import {
  createParamDecorator,
  DefaultValuePipe,
  ExecutionContext,
  HttpException,
  HttpStatus,
  ParseBoolPipe,
} from '@nestjs/common';
import { ErrorFormat, Request } from '@/app.type';

/**
 * Decorator to parse the 'trashed' query parameter.
 *
 * Used to filter soft-deleted data. Defaults to `false` (non-deleted) if not provided.
 * Throws a 400 error if the value is invalid.
 */
export const Trashed = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const errorResponse: ErrorFormat = {
      code: 400,
      error: 'ValidationError',
      message: 'Invalid Request',
      errorItems: [],
    };
    const request = ctx.switchToHttp().getRequest<Request>();
    const { trashed } = request.query;
    const parsedTrashed = new ParseBoolPipe({
      exceptionFactory: (error) => {
        errorResponse.message = error;
        errorResponse.errorItems.push({
          value: trashed,
          property: 'trashed',
        });

        throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
      },
    }).transform(trashed ?? new DefaultValuePipe(false).transform(false), {
      type: 'query',
    });

    return parsedTrashed;
  },
);
