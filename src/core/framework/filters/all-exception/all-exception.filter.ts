import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { ErrorFormat, Request, Response } from '@/app.type';

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  constructor(private logger: Logger) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    /**
     * Logging
     */
    if (host.getType() === 'http') {
      const req = host.switchToHttp().getRequest<Request>();
      /**
       * Logging
       */
      this.logger.verbose(
        `Execute filter [${req.uid}]`,
        AllExceptionFilter.name,
      );
    }

    /**
     * Error response format
     */
    const errorResponse: ErrorFormat = {
      code: 500,
    };

    if (super.isExceptionObject(exception)) {
      errorResponse.error = exception.name || 'UnknownError';
      errorResponse.message = exception.message || 'Unknown error';
    }

    /**
     * Http context
     */
    if (host.getType() === 'http') {
      const req = host.switchToHttp().getRequest<Request>();
      const res = host.switchToHttp().getResponse<Response>();

      /**
       * Logging
       */
      if (super.isExceptionObject(exception)) {
        this.logger.error(
          `[${req.uid}] : ${exception.message || 'Unknown error'}`,
          exception.stack,
          AllExceptionFilter.name,
        );
      } else {
        this.logger.error(
          `[${req.uid}] : ${exception}`,
          "there's no error stack",
          AllExceptionFilter.name,
        );
      }

      res.status(500).json(errorResponse);
    }
  }
}
