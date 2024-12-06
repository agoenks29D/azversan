import {
  createParamDecorator,
  DefaultValuePipe,
  ExecutionContext,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ErrorFormat, Request } from '@/app.type';

/**
 * Decorator to parse and validate the 'limit' query parameter.
 *
 * Parses 'limit' as an integer and defaults to 10 if not provided.
 * Throws a 400 error if invalid.
 */
export const LimitQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const errorResponse: ErrorFormat = {
      code: 400,
      error: 'ValidationError',
      message: 'Invalid request',
      errorItems: [],
    };
    const req = ctx.switchToHttp().getRequest<Request>();
    const { limit } = req.query;
    const parsedLimit = new ParseIntPipe({
      exceptionFactory: (error) => {
        errorResponse.message = error;
        errorResponse.errorItems.push({
          value: limit,
          property: 'limit',
        });

        throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
      },
    }).transform(limit ?? new DefaultValuePipe(10).transform(10), {
      type: 'query',
    });

    return parsedLimit;
  },
);

/**
 * Decorator to parse and validate the 'offset' query parameter.
 *
 * Parses 'offset' as an integer and defaults to 0 if not provided.
 * Throws a 400 error if invalid.
 */
export const OffsetQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const errorResponse: ErrorFormat = {
      code: 400,
      error: 'ValidationError',
      message: 'Invalid request',
      errorItems: [],
    };
    const req = ctx.switchToHttp().getRequest<Request>();
    const { offset } = req.query;
    const parsedOffset = new ParseIntPipe({
      exceptionFactory: (error) => {
        errorResponse.message = error;
        errorResponse.errorItems.push({
          value: offset,
          property: 'offset',
        });

        throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
      },
    }).transform(offset ?? new DefaultValuePipe(0).transform(0), {
      type: 'query',
    });

    return parsedOffset;
  },
);
