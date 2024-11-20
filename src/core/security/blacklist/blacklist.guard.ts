import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { AllConfigType, ErrorFormat, Request } from '@/app.type';
import { BlacklistService } from './blacklist.service';
import { DisableBlacklist } from './blacklist.decorator';
import { SecurityConfig } from '../security.type';

@Injectable()
export class BlacklistGuard implements CanActivate {
  constructor(
    private logger: Logger,
    private reflector: Reflector,
    private configService: ConfigService<AllConfigType>,
    private blacklistService: BlacklistService,
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
      code: HttpStatus.FORBIDDEN,
    };

    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest<Request>();
      /**
       * Logging
       */
      this.logger.verbose(
        `Execute guard [${req.uid}] : ${ctxClass.name}.${ctxMethod.name}`,
        BlacklistGuard.name,
      );
    }

    /**
     * Logging
     */
    this.logger.debug(
      `Can be activated: ${ctxClass.name}.${ctxMethod.name}`,
      BlacklistGuard.name,
    );

    const { blacklistEnable, deviceIdKeyName } =
      this.configService.get<SecurityConfig>('security');

    /**
     * Blacklist disabled
     */
    if (!blacklistEnable) {
      /**
       * Logging
       */
      this.logger.debug('Guard disabled', BlacklistGuard.name);

      return true;
    }

    const disableInClass = this.reflector.get<boolean>(
      DisableBlacklist,
      ctxClass,
    );
    const disableInMethod = this.reflector.get<boolean>(
      DisableBlacklist,
      ctxMethod,
    );

    /**
     * Blaclist disabled from class decorator
     */
    if (disableInClass === true) {
      /**
       * Logging
       */
      this.logger.debug(
        `Guard disabled for class ${ctxClass.name}`,
        BlacklistGuard.name,
      );

      return true;
    }

    /**
     * Blaclist disabled from method decorator
     */
    if (disableInMethod === true) {
      /**
       * Logging
       */
      this.logger.debug(
        `Guard disabled for method ${ctxClass.name}.${ctxMethod.name}`,
        BlacklistGuard.name,
      );

      return true;
    }

    /**
     * Blacklist items
     */
    const blacklist = this.blacklistService.getItems();

    switch (context.getType()) {
      case 'http':
        const httpReq = context.switchToHttp().getRequest<Request>();
        const reqDeviceId = httpReq.headers[deviceIdKeyName.toLowerCase()];
        const blacklistedIP = blacklist.find(
          (item) => item.value === httpReq.ip,
        );
        const blacklistedDevice = blacklist.find(
          (item) => item.type === 'DeviceID' && item.value === reqDeviceId,
        );

        /**
         * Check if the client's IP is blacklisted
         */
        if (blacklistedIP) {
          /**
           * Logging
           */
          this.logger.debug(
            `Access denied: IP address ${httpReq.ip} is blacklisted`,
            BlacklistGuard.name,
          );

          errorResponse.error = 'BlacklistedIP';
          errorResponse.message = 'IP is blacklisted';
          throw new ForbiddenException(errorResponse);
        }

        /**
         * Check if the client's device is blacklisted
         */
        if (blacklistedDevice) {
          /**
           * Logging
           */
          this.logger.debug(
            `Access denied: device ${reqDeviceId} is blacklisted`,
            BlacklistGuard.name,
          );

          errorResponse.error = 'BlacklistedDevice';
          errorResponse.message = 'Device is blacklisted';
          throw new ForbiddenException(errorResponse);
        }

        /**
         * Logging
         */
        this.logger.debug(
          `Request from IP ${httpReq.ip} ${reqDeviceId ? `with device ID ${reqDeviceId} ` : ''}successfully passed the blacklist check`,
          BlacklistGuard.name,
        );

        return true;
    }

    /**
     * Logging
     */
    this.logger.error(
      `Unsupported execution context type : ${context.getType()}`,
      BlacklistGuard.name,
    );

    return false;
  }
}
