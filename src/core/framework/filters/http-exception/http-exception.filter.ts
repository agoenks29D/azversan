import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { ErrorFormat, Request, Response } from '@/app.type';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor(private logger: Logger) {
    super();
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
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
        HttpExceptionFilter.name,
      );
    }

    /**
     * Error response format
     */
    const errorResponse: ErrorFormat = {
      code: exception.getStatus(),
    };

    if (this.isFormattedError(exception.getResponse())) {
      const formattedError = exception.getResponse() as ErrorFormat;

      if (this.isValidationError(formattedError)) {
        return super.catch(exception, host);
      }

      errorResponse.error = formattedError.error;
      errorResponse.message = formattedError.message || exception.message;
    } else {
      errorResponse.message = exception.message;
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
      this.logger.error(
        `[${req.uid}] : ${exception.message}`,
        exception.stack,
        HttpExceptionFilter.name,
      );

      res.status(exception.getStatus()).json(errorResponse);
    }
  }

  private isValidationError(response: ErrorFormat): boolean {
    return response.error === 'ValidationError';
  }

  private isFormattedError(response: unknown): boolean {
    return typeof response === 'object' && 'code' in response;
  }
}
