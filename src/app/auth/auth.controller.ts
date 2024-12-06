import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import moment from 'moment';
import { randomNumber } from '@/core/framework/helpers';
import { DisableBearerToken } from '@/core/security/bearer-token/bearer-token.decorator';
import { UserModel } from '@/app/user/models';
import { UserEntity } from '@/app/user/user.entity';
import { UserService } from '@/app/user/user.service';
import { ErrorFormat, Request } from '@/app.type';
import { AuthService } from './auth.service';
import { JWTContentResetToken } from './auth.type';
import { AuthTokenModel, AuthVerifyModel } from './models';
import {
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from './auth.dto';

@Controller('auth')
@DisableBearerToken()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(UserModel) private userModel: typeof UserModel,
    @InjectModel(AuthTokenModel)
    private authTokenModel: typeof AuthTokenModel,
    @InjectModel(AuthVerifyModel)
    private authVerifyModel: typeof AuthVerifyModel,
  ) {}

  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    const errorResponse: ErrorFormat = {
      code: 400,
      error: 'ValidationError',
      message: 'Invalid request',
      errorItems: [],
    };
    const isEmailRegistered = await this.userService.isEmailRegistered(
      body.email,
    );
    const isUsernameRegistered = await this.userService.isUsernameRegistered(
      body.username,
    );

    if (isEmailRegistered) {
      errorResponse.errorItems.push({
        property: 'email',
        constraints: {
          isRegistered: 'email already registered',
        },
      });
    }

    if (isUsernameRegistered) {
      errorResponse.errorItems.push({
        property: 'username',
        constraints: {
          isRegistered: 'username already registered',
        },
      });
    }

    if (errorResponse.errorItems.length > 0) {
      throw new BadRequestException(errorResponse);
    }

    /**
     * Create new user
     */
    const user = await this.userModel.create({
      email: body.email,
      username: body.username,
      password: this.userService.encryptPassword(body.password),
      isAdmin: false,
      fullName: body.full_name,
    });

    /**
     * Generate access token & refresh token
     */
    const { accessToken, refreshToken } = this.authService.generateToken(
      user.id,
    );

    /**
     * Generate expires
     */
    const [atExp, rtExp] = this.authService.tokenExpires();

    /**
     * Save token to database
     */
    await this.authTokenModel.bulkCreate([
      {
        type: 'access',
        token: accessToken,
        userId: user.id,
        expiresAt: atExp,
      },
      {
        type: 'refresh',
        token: refreshToken,
        userId: user.id,
        expiresAt: rtExp,
      },
    ]);

    return {
      user: new UserEntity(user.dataValues),
      token: accessToken,
      refresh: refreshToken,
    };
  }

  @HttpCode(200)
  @Post('sign-in')
  async signIn(@Body() { identity, password }: SignInDto) {
    const user = await this.userModel.findOne({
      where: {
        [Op.or]: [
          {
            email: {
              [Op.eq]: identity,
            },
          },
          {
            username: {
              [Op.eq]: identity,
            },
          },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Authentication failure');
    }

    if (!this.userService.comparePassword(password, user.password)) {
      throw new UnauthorizedException('Authentication failure');
    }

    /**
     * Generate access token & refresh token
     */
    const { accessToken, refreshToken } = this.authService.generateToken(
      user.id,
    );

    /**
     * Generate expires
     */
    const [atExp, rtExp] = this.authService.tokenExpires();

    /**
     * Save token to database
     */
    await this.authTokenModel.bulkCreate([
      {
        type: 'access',
        token: accessToken,
        userId: user.id,
        expiresAt: atExp,
      },
      {
        type: 'refresh',
        token: refreshToken,
        userId: user.id,
        expiresAt: rtExp,
      },
    ]);

    return {
      user: new UserEntity(user.dataValues),
      token: accessToken,
      refresh: refreshToken,
    };
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Body() { token }: RefreshTokenDto) {
    const errorResponse: ErrorFormat = {
      code: 401,
      error: 'Unauthorized',
      message: 'Invalid request',
      errorItems: [],
    };
    const oldAccessToken = this.getHttpAuthorization(req);
    const findAccessToken = await this.authTokenModel.findOne({
      where: { type: 'access', token: oldAccessToken },
    });

    if (!findAccessToken) {
      errorResponse.message = 'Invalid access token';
      throw new UnauthorizedException(errorResponse);
    }

    if (findAccessToken.isRevoked) {
      errorResponse.message = 'Access token revoked';
      throw new UnauthorizedException(errorResponse);
    }

    const findRefreshToken = await this.authTokenModel.findOne({
      where: { type: 'refresh', token },
    });

    if (!findRefreshToken) {
      errorResponse.message = 'Invalid refresh token';
      throw new UnauthorizedException(errorResponse);
    }

    if (findRefreshToken.isRevoked) {
      errorResponse.message = 'Refresh token revoked';
      throw new UnauthorizedException(errorResponse);
    }

    if (new Date() > findRefreshToken.expiresAt) {
      errorResponse.message = 'Refresh token expired';
      throw new UnauthorizedException(errorResponse);
    }

    if (findAccessToken.userId !== findRefreshToken.userId) {
      throw new UnauthorizedException('Invalid request');
    }

    const { accessToken } = this.authService.generateToken(
      findRefreshToken.userId,
    );
    const [atExp] = this.authService.tokenExpires();

    await findAccessToken.update({ isRevoked: true });
    await this.authTokenModel.create({
      type: 'access',
      token: accessToken,
      expiresAt: atExp,
      userId: findRefreshToken.userId,
    });

    return { token: accessToken };
  }

  @Get('sign-out')
  @DisableBearerToken(false)
  async signOut(@Req() req: Request) {
    const token = this.getHttpAuthorization(req);
    const findAccessToken = await this.authTokenModel.findOne({
      where: { type: 'access', token },
    });

    /**
     * Revoke access token
     */
    await findAccessToken.update({ isRevoked: true });

    return { success: true };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() { identity, recovery_method }: ForgotPasswordDto,
  ) {
    const user = await this.userModel.findOne({
      where: {
        [Op.or]: [
          {
            email: {
              [Op.eq]: identity,
            },
          },
          {
            username: {
              [Op.eq]: identity,
            },
          },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('Account not found');
    }

    if (recovery_method) {
      const code = randomNumber({ length: 6 }).toString();
      await this.authVerifyModel.create({
        code,
        purpose: 'password_recovery',
        userId: user.id,
        expiresAt: moment().add(10, 'minutes').toDate(),
      });

      // todo : send code to recovery method

      return {
        codeSent: true,
        userInfo: new UserEntity(user.dataValues),
      };
    }

    return {
      codeSent: false,
      userInfo: new UserEntity(user.dataValues),
    };
  }

  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() { code, token, new_password }: ResetPasswordDto) {
    const isOneProvided = (!!code && !token) || (!code && !!token);

    if (!isOneProvided) {
      throw new BadRequestException(
        'Either code or token must be provided, but not both',
      );
    }

    if (code) {
      const authVerify = await this.authVerifyModel.findOne({
        where: { code },
      });

      if (!authVerify) {
        throw new BadRequestException('Invalid code');
      }

      if (authVerify.codeIsUsed) {
        throw new BadRequestException('Code is used');
      }

      const jwtContent: JWTContentResetToken = {
        userId: authVerify.userId,
      };
      const resetToken = this.jwtService.sign(jwtContent, {
        expiresIn: '5m',
      });

      await authVerify.update({ codeIsUsed: true, token: resetToken });

      return { token: resetToken };
    }

    if (token) {
      const { userId } = this.jwtService.verify<JWTContentResetToken>(token);
      const authVerify = await this.authVerifyModel.findOne({
        where: { token, userId },
      });

      if (!authVerify) {
        throw new BadRequestException('Invalid token');
      }

      if (authVerify.tokenIsUsed) {
        throw new BadRequestException('Token is used');
      }

      const user = await this.userModel.findByPk(authVerify.userId);

      if (!user) {
        throw new NotFoundException("Account doesn't exist");
      }

      await user.update({
        password: this.userService.encryptPassword(new_password),
      });

      return { success: true };
    }
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
