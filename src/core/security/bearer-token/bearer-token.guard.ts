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
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { AuthTokenModel } from '@/app/auth/models';
import { UserModel } from '@/app/user/models';
import { UserEntity } from '@/app/user/user.entity';
import { JWTContentUserToken } from '@/app/user/user.type';
import { AllConfigType, ErrorFormat, Request } from '@/app.type';
import { DisableBearerToken } from './bearer-token.decorator';
import { SecurityConfig } from '../security.type';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private logger: Logger,
    private reflector: Reflector,
    private configService: ConfigService<AllConfigType>,
    private jwtService: JwtService,
    @InjectModel(AuthTokenModel) private authTokenModel: typeof AuthTokenModel,
    @InjectModel(UserModel) private userModel: typeof UserModel,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
        BearerTokenGuard.name,
      );
    }

    /**
     * Logging
     */
    this.logger.debug(
      `Can be activated: ${ctxClass.name}.${ctxMethod.name}`,
      BearerTokenGuard.name,
    );

    const { jwtEnable } = this.configService.get<SecurityConfig>('security');

    /**
     * Bearer token disabled
     */
    if (!jwtEnable) {
      /**
       * Logging
       */
      this.logger.debug('Guard disabled', BearerTokenGuard.name);

      return true;
    }

    const disableInClass = this.reflector.get<boolean>(
      DisableBearerToken,
      ctxClass,
    );
    const disableInMethod = this.reflector.get<boolean>(
      DisableBearerToken,
      ctxMethod,
    );

    /**
     * Bearer token auth disabled from class decorator
     */
    if (disableInClass === true) {
      /**
       * Logging
       */
      this.logger.debug(
        `Guard disabled for class ${ctxClass.name}`,
        BearerTokenGuard.name,
      );

      return true;
    }

    /**
     * Bearer token auth disabled from method decorator
     */
    if (disableInMethod === true) {
      /**
       * Logging
       */
      this.logger.debug(
        `Guard disabled for method ${ctxClass.name}.${ctxMethod.name}`,
        BearerTokenGuard.name,
      );

      return true;
    }

    /**
     * Request context
     */
    switch (context.getType()) {
      case 'http':
        const httpReq = context.switchToHttp().getRequest<Request>();
        const token = this.getHttpAuthorization(httpReq);

        if (!token) {
          /**
           * Logging
           */
          this.logger.debug(
            'No Authorization Bearer token provided',
            BearerTokenGuard.name,
          );

          errorResponse.error = 'AuthorizationTokenMissing';
          throw new UnauthorizedException(errorResponse);
        }

        const authToken = await this.authTokenModel.findOne({
          where: { token },
        });

        if (!authToken) {
          /**
           * Logging
           */
          this.logger.debug('Invalid token', BearerTokenGuard.name);

          errorResponse.error = 'InvalidToken';
          errorResponse.message = 'Invalid token';
          throw new UnauthorizedException(errorResponse);
        }

        if (authToken.isRevoked) {
          /**
           * Logging
           */
          this.logger.debug('Token revoked', BearerTokenGuard.name);

          errorResponse.error = 'TokenRevoked';
          errorResponse.message = 'Token revoked';
          throw new UnauthorizedException(errorResponse);
        }

        try {
          const { type, userId } =
            this.jwtService.verify<JWTContentUserToken>(token);
          const user = await this.userModel.findByPk(userId);

          if (type !== 'access') {
            errorResponse.error = 'InvalidTokenType';
            errorResponse.message = 'Invalid token type';
            throw new UnauthorizedException(errorResponse);
          }

          if (!user) {
            errorResponse.error = 'AccountDeleted';
            errorResponse.message = 'Your account has been deleted';
            throw new UnauthorizedException(errorResponse);
          }

          httpReq.user = new UserEntity(user.dataValues);

          /**
           * Logging
           */
          this.logger.debug(
            `Authenticated as user : [${userId}] ${user.fullName}`,
            BearerTokenGuard.name,
          );

          return true;
        } catch (error) {
          if (error.name === 'JsonWebTokenError') {
            /**
             * Logging
             */
            this.logger.debug('Invalid token', BearerTokenGuard.name);
            errorResponse.error = 'InvalidToken';
          }

          if (error.name === 'TokenExpiredError') {
            /**
             * Logging
             */
            this.logger.debug('Token expired', BearerTokenGuard.name);
            errorResponse.error = 'TokenExpired';
          }

          throw new UnauthorizedException(errorResponse, { cause: error });
        }
    }

    /**
     * Logging
     */
    this.logger.error(
      `Unsupported execution context type : ${context.getType()}`,
      BearerTokenGuard.name,
    );

    return false;
  }

  /**
   * Retrieves the Bearer token from the Authorization header of the HTTP request.
   * @param request - The HTTP request object from which to extract the token.
   */
  private getHttpAuthorization(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
