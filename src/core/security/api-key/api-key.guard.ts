import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { AllConfigType, ErrorFormat, Request } from '@/app.type';
import { APIKeyService } from './api-key.service';
import { DisableAPIKey } from './api-key.decorator';
import { SecurityConfig } from '../security.type';

@Injectable()
export class APIKeyGuard implements CanActivate {
  constructor(
    private logger: Logger,
    private reflector: Reflector,
    private configService: ConfigService<AllConfigType>,
    private apiKeyService: APIKeyService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    /**
     * Retrieve class and method from the execution context
     */
    const ctxClass = context.getClass();
    const ctxMethod = context.getHandler();

    /**
     * Error response
     */
    const errorResponse: ErrorFormat = {
      code: HttpStatus.UNAUTHORIZED,
    };

    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest<Request>();
      /**
       * Logging
       */
      this.logger.verbose(
        `Execute guard [${req.uid}] : ${ctxClass.name}.${ctxMethod.name}`,
        APIKeyGuard.name,
      );
    }

    /**
     * Logging
     */
    this.logger.debug(
      `Can be activated: ${ctxClass.name}.${ctxMethod.name}`,
      APIKeyGuard.name,
    );

    const { apiKeyAuthEnable, apiKeyAuthKeyName } =
      this.configService.get<SecurityConfig>('security');

    /**
     * API key auth disabled
     */
    if (!apiKeyAuthEnable) {
      /**
       * Logging
       */
      this.logger.debug('Guard disabled', APIKeyGuard.name);

      return true;
    }

    const disableInClass = this.reflector.get<boolean>(DisableAPIKey, ctxClass);
    const disableInMethod = this.reflector.get<boolean>(
      DisableAPIKey,
      ctxMethod,
    );

    /**
     * API key auth disabled from class decorator
     */
    if (disableInClass === true) {
      /**
       * Logging
       */
      this.logger.debug(
        `Guard disabled for class ${ctxClass.name}`,
        APIKeyGuard.name,
      );

      return true;
    }

    /**
     * API key auth disabled from method decorator
     */
    if (disableInMethod === true) {
      /**
       * Logging
       */
      this.logger.debug(
        `Guard disabled for method ${ctxClass.name}.${ctxMethod.name}`,
        APIKeyGuard.name,
      );

      return true;
    }

    switch (context.getType()) {
      case 'http':
        const httpReq = context.switchToHttp().getRequest<Request>();
        const apiKeyReq = httpReq.headers[apiKeyAuthKeyName.toLowerCase()];

        if (!apiKeyReq) {
          /**
           * Logging
           */
          this.logger.debug(
            'No API key provided in the request',
            APIKeyGuard.name,
          );

          errorResponse.error = 'APIKeyRequired';
          throw new UnauthorizedException(errorResponse);
        }

        const apiKeys = this.apiKeyService.getKeys();
        const validateKey = apiKeys.find(
          (apiKey) => apiKey.value === apiKeyReq,
        );
        const isValid = typeof validateKey !== 'undefined';

        /**
         * Logging
         */
        this.logger.debug(`API key valid : ${isValid}`, APIKeyGuard.name);

        if (!isValid) {
          errorResponse.error = 'InvalidAPIKey';
          throw new UnauthorizedException(errorResponse);
        }

        return isValid;
    }

    /**
     * Logging
     */
    this.logger.error(
      `Unsupported execution context type : ${context.getType()}`,
      APIKeyGuard.name,
    );

    return false;
  }
}
